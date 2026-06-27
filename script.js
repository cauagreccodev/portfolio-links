const profileImage = document.querySelector("[data-profile-image]");
const year = document.querySelector("[data-year]");
const ambientCode = document.querySelector(".ambient-code");
const avatarImageEndpoint = "/api/instagram-avatar-image";

if (year) {
  year.textContent = new Date().getFullYear();
}

function canUseLocalApi() {
  return window.location.protocol !== "file:";
}

function setProfileImageSource(source) {
  if (profileImage && source && profileImage.src !== source) {
    profileImage.src = source;
  }
}

if (profileImage) {
  profileImage.referrerPolicy = "no-referrer";

  profileImage.addEventListener("error", () => {
    const directInstagramSource = profileImage.dataset.instagramSrc;
    const isEndpointSource = profileImage.src.endsWith(avatarImageEndpoint);

    if (
      isEndpointSource &&
      directInstagramSource &&
      profileImage.dataset.triedDirectSource !== "true"
    ) {
      profileImage.dataset.triedDirectSource = "true";
      setProfileImageSource(directInstagramSource);
      return;
    }

    if (
      canUseLocalApi() &&
      !isEndpointSource &&
      profileImage.dataset.triedEndpointSource !== "true"
    ) {
      profileImage.dataset.triedEndpointSource = "true";
      setProfileImageSource(avatarImageEndpoint);
    }
  });

  setProfileImageSource(
    canUseLocalApi() ? avatarImageEndpoint : profileImage.dataset.instagramSrc,
  );
}

const particles = [
  "</>",
  "{ }",
  "git",
  "API",
  "JS",
  "dev",
  "push",
  "build",
  "01",
  "fn",
];

const tones = ["#55ff91", "#8e72ff", "#63d8ff", "#ffd166", "#f7f7f7"];

if (ambientCode && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const amount = Math.min(18, Math.max(10, Math.floor(window.innerWidth / 34)));

  for (let index = 0; index < amount; index += 1) {
    const item = document.createElement("span");
    item.textContent = particles[index % particles.length];
    item.style.setProperty("--x", `${Math.random() * 96}%`);
    item.style.setProperty("--y", `${Math.random() * 94}%`);
    item.style.setProperty("--size", `${Math.random() * 8 + 12}px`);
    item.style.setProperty("--tone", tones[index % tones.length]);
    item.style.setProperty("--duration", `${Math.random() * 5 + 8}s`);
    item.style.setProperty("--delay", `${Math.random() * -9}s`);
    item.style.setProperty("--rotation", `${Math.random() * 42 - 21}deg`);
    ambientCode.appendChild(item);
  }
}

async function updateInstagramAvatar() {
  if (!profileImage || !canUseLocalApi()) {
    return;
  }

  try {
    const response = await fetch("/api/instagram-avatar", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.avatarUrl) {
      profileImage.dataset.instagramSrc = data.avatarUrl;
    }

    if (!profileImage.src.endsWith(avatarImageEndpoint)) {
      setProfileImageSource(data.avatarUrl);
    }
  } catch {
    setProfileImageSource(avatarImageEndpoint);
  }
}

updateInstagramAvatar();
