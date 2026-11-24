const site = window.SITE;
document.getElementById("brand").textContent = site.name;
document.getElementById("mark").src = site.avatar;
document.getElementById("mark").alt = site.name;

const slug = new URLSearchParams(location.search).get("slug");
const post = (window.POSTS || []).find((item) => item.slug === slug);
const card = document.getElementById("note-card");
window.renderNote(card, post || null);
document.title = (post ? post.title : "找不到这篇笔记") + " · " + site.name;
