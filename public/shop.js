window.renderBooks = function (parent) {
  const shelf = document.createElement("div");
  shelf.className = "books";
  (window.SHOP || []).forEach(function (item) {
    const card = document.createElement("a");
    card.className = "book";
    card.href = item.href;
    card.innerHTML =
      '<span class="layer back"></span>' +
      '<span class="layer page" style="--n:4"></span>' +
      '<span class="layer page" style="--n:3"></span>' +
      '<span class="layer page" style="--n:2"></span>' +
      '<span class="layer page" style="--n:1"><span class="page-note"></span></span>' +
      '<span class="layer cover" style="--n:0">' +
        '<span class="cover-art"></span>' +
        '<span class="cover-body"><h3></h3><p></p><span class="cover-go">进店</span></span>' +
      "</span>";
    card.querySelector(".page-note").textContent = item.note || "进店购买";
    if (item.cover) card.querySelector(".cover-art").style.backgroundImage = "url(\"" + item.cover + "\")";
    card.querySelector("h3").textContent = item.title;
    card.querySelector("p").textContent = item.excerpt || "";
    shelf.appendChild(card);
  });
  parent.appendChild(shelf);
};
