const site = window.SITE;
const posts = window.POSTS;

document.title = site.name;
document.getElementById("brand").textContent = site.name;
document.getElementById("mark").src = site.avatar;
document.getElementById("mark").alt = site.name;
document.getElementById("line").textContent = site.line;

const LOG = "折腾.log";
const LAB = "改造实验室";

function openOnClick(node, slug) {
  node.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    window.openNote(slug);
  });
}

function addCard(list, post, index) {
  const a = document.createElement("a");
  a.className = "feed-card";
  a.href = "post.html?slug=" + encodeURIComponent(post.slug);
  a.dataset.tag = post.tag;
  a.style.setProperty("--d", (index * 60) + "ms");
  a.innerHTML =
    "<span class=\"feed-top\"><span class=\"tag\"></span></span>" +
    "<strong></strong><span class=\"excerpt\"></span>" +
    "<span class=\"feed-go\"><time></time><b>打开 →</b></span>";
  a.querySelector(".tag").textContent = post.tag;
  a.querySelector("time").dateTime = post.date;
  a.querySelector("time").textContent = post.date;
  a.querySelector("strong").textContent = post.title;
  a.querySelector(".excerpt").textContent = post.excerpt;
  openOnClick(a, post.slug);
  list.appendChild(a);
}

const aboutList = document.getElementById("about-list");
(site.contacts || []).forEach((item) => {
  const row = document.createElement(item.href ? "a" : "div");
  row.className = "contact";
  if (item.href) row.href = item.href;
  row.innerHTML = "<b></b><span></span>";
  row.querySelector("b").textContent = item.label;
  row.querySelector("span").textContent = item.value;
  aboutList.appendChild(row);
});

const feed = document.getElementById("feed");
const slides = document.getElementById("slides");
const dots = document.getElementById("dots");
const spot = document.getElementById("spot");
const filters = document.getElementById("filters");
const live = document.getElementById("note-live");
if (live) live.textContent = "共 " + posts.length + " 篇";

posts.forEach((post, index) => {
  const a = document.createElement("a");
  a.className = "slide";
  a.href = "post.html?slug=" + encodeURIComponent(post.slug);
  const parts = (post.date || "").split("-");
  a.innerHTML =
    "<div><div class=\"s-tag\"></div><h3></h3><p></p></div>" +
    "<div class=\"count\"><b></b><small></small></div>";
  const tags = a.querySelector(".s-tag");
  if (index === 0) {
    const hot = document.createElement("span");
    hot.className = "hot";
    hot.textContent = "最新";
    tags.appendChild(hot);
  }
  const cat = document.createElement("span");
  cat.textContent = post.tag;
  tags.appendChild(cat);
  a.querySelector("h3").textContent = post.title;
  a.querySelector("p").textContent = post.excerpt;
  a.querySelector("b").textContent = parts.length === 3 ? parts[1] + "." + parts[2] : post.date;
  a.querySelector("small").textContent = parts[0] || "";
  openOnClick(a, post.slug);
  slides.appendChild(a);

  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", "第 " + (index + 1) + " 篇，" + post.title);
  dot.addEventListener("click", () => { go(index); play(); });
  dots.appendChild(dot);

  addCard(feed, post, index);
});

const buckets = [
  ["全部", ""],
  ["改造实验室", LAB],
  ["折腾.log", LOG],
  ["其他笔记", "其他"]
];
buckets.forEach(([label, key]) => {
  const count = key === ""
    ? posts.length
    : key === "其他"
      ? posts.filter((post) => post.tag !== LAB && post.tag !== LOG).length
      : posts.filter((post) => post.tag === key).length;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.key = key;
  button.setAttribute("role", "tab");
  button.innerHTML = "<span></span><small></small>";
  button.querySelector("span").textContent = label;
  button.querySelector("small").textContent = String(count);
  button.addEventListener("click", () => applyFilter(key));
  filters.appendChild(button);
});

function applyFilter(key) {
  filters.querySelectorAll("button").forEach((button) => {
    const on = button.dataset.key === key;
    button.classList.toggle("on", on);
    button.setAttribute("aria-selected", on ? "true" : "false");
  });
  let shown = 0;
  feed.querySelectorAll(".feed-card").forEach((card) => {
    const tag = card.dataset.tag;
    const match = key === "" || (key === "其他" ? tag !== LAB && tag !== LOG : tag === key);
    card.classList.toggle("is-out", !match);
    if (match) card.style.setProperty("--d", (shown++ * 60) + "ms");
  });
  let empty = feed.querySelector(".feed-empty");
  if (!shown) {
    if (!empty) {
      empty = document.createElement("p");
      empty.className = "feed-empty";
      empty.textContent = "这一栏还没有笔记。";
      feed.appendChild(empty);
    }
  } else if (empty) empty.remove();
}

function filterFromHash() {
  if (location.hash === "#lab") return LAB;
  if (location.hash === "#log") return LOG;
  if (location.hash === "#posts") return "其他";
  return "";
}

let index = 0;
let timer = 0;
function go(n) {
  if (!posts.length) return;
  index = (n + posts.length) % posts.length;
  slides.style.transform = "translateX(" + (-index * 100) + "%)";
  dots.querySelectorAll("button").forEach((button, i) => {
    button.classList.toggle("on", i === index);
  });
}
function stop() { clearInterval(timer); timer = 0; }
function play() {
  stop();
  if (posts.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(() => go(index + 1), 4500);
}
if (spot) {
  spot.addEventListener("mouseenter", stop);
  spot.addEventListener("mouseleave", play);
  spot.addEventListener("focusin", stop);
  spot.addEventListener("focusout", (event) => {
    if (!spot.contains(event.relatedTarget)) play();
  });
}
document.addEventListener("visibilitychange", () => { document.hidden ? stop() : play(); });
go(0);
play();
applyFilter(filterFromHash());
window.addEventListener("hashchange", () => applyFilter(filterFromHash()));

const motionOk = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const seen = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    seen.unobserve(entry.target);
  });
}, { threshold: 0.16 });
document.querySelectorAll(".reveal").forEach((node) => {
  if (!motionOk) node.classList.add("in");
  else seen.observe(node);
});

const nav = document.getElementById("nav");
document.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 4);
}, { passive: true });
