const USERNAME = "cauagreccodev";
const INSTAGRAM_APP_ID = "936619743392459";

async function fetchInstagramAvatarUrl() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
    USERNAME,
  )}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "x-ig-app-id": INSTAGRAM_APP_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Instagram responded with ${response.status}`);
    }

    const payload = await response.json();
    const user = payload?.data?.user;
    const avatarUrl = user?.profile_pic_url_hd || user?.profile_pic_url;

    if (!avatarUrl) {
      throw new Error("Instagram profile image was not present");
    }

    return avatarUrl;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.end();
    return;
  }

  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, OPTIONS");
    response.end("Method not allowed");
    return;
  }

  try {
    const avatarUrl = await fetchInstagramAvatarUrl();
    const imageResponse = await fetch(avatarUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Instagram image responded with ${imageResponse.status}`);
    }

    const image = Buffer.from(await imageResponse.arrayBuffer());

    response.statusCode = 200;
    response.setHeader(
      "Content-Type",
      imageResponse.headers.get("content-type") || "image/jpeg",
    );
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    response.end(image);
  } catch {
    response.statusCode = 502;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Cache-Control", "public, s-maxage=60");
    response.end("Instagram avatar unavailable");
  }
};
