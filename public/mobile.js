(function () {
  const mq = matchMedia("(max-width: 640px)");
  const root = document.documentElement;
  const bar = document.querySelector(".m-bar");

  function fit() {
    root.classList.toggle("m-app", mq.matches);
  }
  mq.addEventListener("change", fit);
  fit();
  if (bar) {
    document.addEventListener("scroll", function () {
      bar.classList.toggle("solid", window.scrollY > 8);
    }, { passive: true });
  }
  if (root.classList.contains("post-page")) {
    const title = document.getElementById("m-bar-title");
    const heading = document.getElementById("title");
    if (title && heading) title.textContent = heading.textContent;
    return;
  }

  const shell = document.getElementById("m-shell");
  const posts = window.POSTS || [];
  const site = window.SITE;
  if (!shell || !site) return;

  const LOG = "折腾.log";
  const colors = [
    ["#ff8a5b", "#ff6b3d"],
    ["#7ec8ff", "#3b82f6"],
    ["#86efac", "#16a34a"],
    ["#c4b5fd", "#7c3aed"]
  ];
  const chev = "<span class=\"m-chev\" aria-hidden=\"true\">›</span>";

  function row(post, index) {
    const pair = colors[index % colors.length];
    const a = document.createElement("a");
    a.href = "post.html?slug=" + encodeURIComponent(post.slug);
    if (post.date) {
      a.className = "m-row m-note";
      a.innerHTML = "<span class=\"m-pills\"><span class=\"tag\"></span><time></time></span><span class=\"m-t\"><b></b><small></small></span>" + chev;
      a.querySelector(".tag").textContent = post.tag;
      a.querySelector("time").dateTime = post.date;
      a.querySelector("time").textContent = post.date;
    } else {
      a.className = "m-row m-shop";
      a.innerHTML = "<span class=\"shop-mark\" aria-hidden=\"true\"><i class=\"bell\"></i></span><span class=\"m-t\"><b></b><small></small></span>" + chev;
    }
    a.querySelector("b").textContent = post.title;
    a.querySelector("small").textContent = post.excerpt;
    if ((window.POSTS || []).some(function (item) { return item.slug === post.slug; })) {
      a.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        window.openNote(post.slug);
      });
    }
    return a;
  }

  function group(items) {
    const box = document.createElement("div");
    box.className = "m-group";
    items.forEach(function (post, index) { box.appendChild(row(post, index)); });
    return box;
  }

  const home = shell.querySelector(".m-view-home");
  home.innerHTML = "";
  const head = document.createElement("div");
  head.className = "m-home-head";
  head.innerHTML = "<div><h1></h1><p></p></div><img alt=\"\">";
  head.querySelector("h1").textContent = site.name;
  head.querySelector("p").textContent = site.line;
  const photo = head.querySelector("img");
  photo.src = site.avatar;
  photo.alt = site.name;
  home.appendChild(head);

  const card = document.createElement("div");
  card.className = "m-feature";
  card.innerHTML = "<img class=\"feature-bg\" alt=\"\" src=\"media/home-card.jpg\"><h2></h2>";
  card.querySelector("h2").textContent = "你只是学会了用AI包装自己的平庸。";
  home.appendChild(card);

  const LAB = "改造实验室";
  const logs = posts.filter(function (post) { return post.tag === LOG; });
  const labs = posts.filter(function (post) { return post.tag === LAB; });
  const rest = posts.filter(function (post) { return post.tag !== LOG && post.tag !== LAB; });

  function section(parent, label, items) {
    if (!items.length) return;
    const sec = document.createElement("div");
    sec.className = "m-sec";
    sec.textContent = label;
    parent.appendChild(sec);
    parent.appendChild(group(items));
  }
  const door = document.createElement("div");
  door.className = "m-sec";
  door.textContent = "小卖部";
  home.appendChild(door);
  const doorBox = document.createElement("div");
  doorBox.className = "m-group";
  const doorLink = row({ title: "小卖部", excerpt: "点进去看在卖什么。", slug: "shop" }, 0);
  doorLink.href = "#shop";
  doorLink.addEventListener("click", function (event) {
    event.preventDefault();
    show("shop");
  });
  doorBox.appendChild(doorLink);
  home.appendChild(doorBox);
  section(home, "改造实验室", labs);
  section(home, "折腾.log", logs);
  section(home, "其他笔记", rest);

  function page(node, title, items) {
    node.innerHTML = "";
    const h = document.createElement("h1");
    h.className = "m-large";
    h.textContent = title;
    node.appendChild(h);
    if (items.length) node.appendChild(group(items));
  }
  const shopView = shell.querySelector(".m-view-shop");
  shopView.innerHTML = "";
  const shopTitle = document.createElement("h1");
  shopTitle.className = "m-large";
  shopTitle.textContent = "小卖部";
  shopView.appendChild(shopTitle);
  if (window.renderBooks) window.renderBooks(shopView);
  page(shell.querySelector(".m-view-lab"), "改造实验室", labs);
  page(shell.querySelector(".m-view-log"), "折腾.log", logs);
  page(shell.querySelector(".m-view-posts"), "笔记", posts);

  const about = shell.querySelector(".m-view-about");
  if (about) {
    about.innerHTML = "";
    const heading = document.createElement("h1");
    heading.className = "m-large";
    heading.textContent = "关于";
    about.appendChild(heading);
    const people = site.contacts || [];
    if (people.length) {
      const card = document.createElement("div");
      card.className = "m-group";
      people.forEach(function (item) {
        const row = document.createElement(item.href ? "a" : "div");
        row.className = "m-row";
        row.innerHTML = "<span class=\"m-t\"><b></b></span><span class=\"m-contact-value\"></span>";
        if (item.href) {
          row.href = item.href;
          row.insertAdjacentHTML("beforeend", chev);
        }
        row.querySelector("b").textContent = item.label;
        row.querySelector(".m-contact-value").textContent = item.value;
        card.appendChild(row);
      });
      about.appendChild(card);
    }
  }

  const title = document.getElementById("m-bar-title");
  function show(view) {
    root.dataset.view = view;
    const names = { home: site.name, shop: "小卖部", lab: "改造实验室", log: "折腾.log", posts: "笔记", about: "关于" };
    title.textContent = names[view] || site.name;
    shell.querySelectorAll(".m-tabs button").forEach(function (button) {
      button.classList.toggle("on", button.dataset.view === view);
    });
    window.scrollTo(0, 0);
  }
  shell.querySelectorAll(".m-tabs button").forEach(function (button) {
    button.addEventListener("click", function () { show(button.dataset.view); });
  });
  const back = shell.querySelector(".m-back");
  if (back) back.addEventListener("click", function () { show("home"); });

  const hash = location.hash;
  const views = { "#shop": "shop", "#lab": "lab", "#log": "log", "#posts": "posts", "#about": "about" };
  show(views[hash] || "home");
})();
