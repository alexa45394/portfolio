console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "cv.html", title: "Resume" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/alexa45394", title: "GitHub" }
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/portfolio/";

const nav = document.createElement("nav");
document.body.prepend(nav);

for (const p of pages) {
  let url = p.url;

  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  const a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  const isExternal = a.host && a.host !== location.host;
  if (isExternal) {
    a.target = "_blank";
  }

  const current =
    a.host === location.host && a.pathname === location.pathname;

  if (current) {
    a.classList.add("current");
  }

  nav.append(a);
}