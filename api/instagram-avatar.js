const USERNAME = "cauagreccodev";
const FALLBACK_AVATAR =
  "https://instagram.fcpq17-1.fna.fbcdn.net/v/t51.82787-19/732657159_18192697888327696_7788950515101990073_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmV4cGVyaW1lbnRhbCJ9&_nc_ht=instagram.fcpq17-1.fna.fbcdn.net&_nc_cat=104&_nc_oc=Q6cZ2gFVI0Z9kHSaCAxCNUrIqhSLFeUX-mGzbFf4hnBq6bOTkkdKtZljMtuCx5X9sKj9rQDcVIXslD4kR_KTda7VgbPV&_nc_ohc=cwQIrTAu9LwQ7kNvwG2Spuz&_nc_gid=psqlpXSvjNQUD4l0zjnVyg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af9cGmSQal7d7w4vhnkoAxSXMQZZ8T8Hni9w4oapKL0OGA&oe=6A451A6C&_nc_sid=8b3546";
const INSTAGRAM_APP_ID = "936619743392459";

function sendJson(response, statusCode, payload, cacheControl) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cacheControl);
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(JSON.stringify(payload));
}

async function fetchInstagramProfile() {
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

    return {
      avatarUrl,
      fullName: user.full_name || "Cauã Grecco",
      username: user.username || USERNAME,
      source: "instagram",
      updatedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(
      response,
      405,
      { error: "method_not_allowed" },
      "public, max-age=300",
    );
    return;
  }

  try {
    const profile = await fetchInstagramProfile();
    sendJson(
      response,
      200,
      profile,
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
  } catch {
    sendJson(
      response,
      200,
      {
        avatarUrl: FALLBACK_AVATAR,
        username: USERNAME,
        source: "fallback",
        updatedAt: new Date().toISOString(),
      },
      "public, s-maxage=300, stale-while-revalidate=3600",
    );
  }
};
