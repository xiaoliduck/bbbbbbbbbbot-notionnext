function safeUrl(url) {
  const value = String(url || "").trim();
  if (!value || /^javascript:/i.test(value) || /^data:/i.test(value)) return "";
  return value;
}

function appendInline(parent, text) {
  const re = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;
  let last = 0;
  let match;
  while ((match = re.exec(text))) {
    if (match.index > last) parent.appendChild(document.createTextNode(text.slice(last, match.index)));
    if (match[0].charAt(0) === "!") {
      const src = safeUrl(match[2]);
      if (src) {
        const img = document.createElement("img");
        img.className = "post-figure";
        img.alt = match[1];
        img.src = src;
        parent.appendChild(img);
      }
    } else if (match[3] !== undefined) {
      const href = safeUrl(match[4]);
      const link = document.createElement(href ? "a" : "span");
      if (href) {
        link.href = href;
        if (/^https?:/i.test(href)) {
          link.target = "_blank";
          link.rel = "noopener";
        }
      }
      link.textContent = match[3];
      parent.appendChild(link);
    } else if (match[5] !== undefined) {
      const strong = document.createElement("strong");
      strong.textContent = match[5];
      parent.appendChild(strong);
    } else if (match[6] !== undefined) {
      const code = document.createElement("code");
      code.textContent = match[6];
      parent.appendChild(code);
    } else if (match[7] !== undefined) {
      const em = document.createElement("em");
      em.textContent = match[7];
      parent.appendChild(em);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
}

window.renderMarkdown = function (root, source) {
  const lines = String(source).replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  const buf = [];
  function flush() {
    if (!buf.length) return;
    const p = document.createElement("p");
    appendInline(p, buf.join(" "));
    root.appendChild(p);
    buf.length = 0;
  }
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      const wrap = document.createElement("div");
      wrap.className = "code-block";
      const pre = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.textContent = code.join("\n");
      pre.appendChild(codeEl);
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "code-copy";
      copy.textContent = "复制";
      copy.addEventListener("click", function () {
        const done = function () {
          copy.textContent = "已复制";
          setTimeout(function () { copy.textContent = "复制"; }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(codeEl.textContent).then(done).catch(function () {});
        }
      });
      wrap.append(pre, copy);
      root.appendChild(wrap);
      i += 1;
      continue;
    }
    if (!line.trim()) {
      flush();
      i += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const el = document.createElement("h" + (heading[1].length + 1));
      const step = /^(\d+)\.\s+(.*)$/.exec(heading[2]);
      if (step) {
        el.className = "step-h";
        const n = document.createElement("span");
        n.className = "step-n";
        n.textContent = step[1];
        el.appendChild(n);
        appendInline(el, step[2]);
      } else {
        appendInline(el, heading[2]);
      }
      root.appendChild(el);
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flush();
      root.appendChild(document.createElement("hr"));
      i += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const block = document.createElement("blockquote");
      appendInline(block, quote.join(" "));
      root.appendChild(block);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flush();
      const list = document.createElement("ul");
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        const item = document.createElement("li");
        appendInline(item, lines[i].replace(/^[-*]\s+/, ""));
        list.appendChild(item);
        i += 1;
      }
      root.appendChild(list);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flush();
      const list = document.createElement("ol");
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const item = document.createElement("li");
        appendInline(item, lines[i].replace(/^\d+\.\s+/, ""));
        list.appendChild(item);
        i += 1;
      }
      root.appendChild(list);
      continue;
    }
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(line.trim())) {
      flush();
      const holder = document.createElement("p");
      appendInline(holder, line.trim());
      root.appendChild(holder.childNodes.length === 1 ? holder.firstChild : holder);
      i += 1;
      continue;
    }
    buf.push(line.trim());
    i += 1;
  }
  flush();
};

window.renderNote = function (root, post) {
  const tag = root.querySelector(".tag");
  const title = root.querySelector("h1, h2");
  const date = root.querySelector("time");
  const body = root.querySelector(".body");
  if (!title || !body) return false;
  body.replaceChildren();
  if (!post) {
    if (tag) tag.textContent = "";
    title.textContent = "找不到这篇笔记";
    if (date) {
      date.textContent = "";
      date.removeAttribute("datetime");
    }
    const p = document.createElement("p");
    p.textContent = "链接里的 slug 对不上 site.js。回到首页再点一次。";
    body.appendChild(p);
    return false;
  }
  if (tag) tag.textContent = post.tag;
  title.textContent = post.title;
  if (date) {
    date.dateTime = post.date;
    date.textContent = post.date;
  }
  const markdown = typeof post.md === "string" ? post.md : (typeof post.body === "string" ? post.body : null);
  if (markdown !== null) {
    window.renderMarkdown(body, markdown);
    return true;
  }
  (post.body || []).forEach(function (block) {
    if (typeof block === "string") {
      const p = document.createElement("p");
      p.textContent = block;
      body.appendChild(p);
      return;
    }
    if (block.h) {
      const h = document.createElement("h2");
      h.textContent = block.h;
      body.appendChild(h);
      return;
    }
    if (block.img) {
      const img = document.createElement("img");
      img.className = "post-figure";
      img.src = block.img;
      img.alt = block.alt || "";
      body.appendChild(img);
      return;
    }
    if (block.note) {
      const aside = document.createElement("aside");
      aside.className = "post-note";
      const strong = document.createElement("strong");
      strong.textContent = block.title || "注意";
      const p = document.createElement("p");
      p.textContent = block.note;
      aside.append(strong, p);
      body.appendChild(aside);
    }
  });
  return true;
};

let noteCloseTimer = 0;

window.openNote = function (slug) {
  const modal = document.getElementById("note-modal");
  const card = modal && modal.querySelector(".note-card");
  const post = (window.POSTS || []).find(function (item) { return item.slug === slug; });
  if (!modal || !card || !post || !window.renderNote(card, post)) return;
  clearTimeout(noteCloseTimer);
  modal.classList.remove("out");
  modal.hidden = false;
  document.body.classList.add("note-open");
  const close = modal.querySelector("[data-close]");
  if (close) close.focus();
};

window.closeNote = function () {
  const modal = document.getElementById("note-modal");
  if (!modal || modal.hidden || modal.classList.contains("out")) return;
  const finish = function () {
    modal.hidden = true;
    modal.classList.remove("out");
    document.body.classList.remove("note-open");
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }
  modal.classList.add("out");
  noteCloseTimer = setTimeout(finish, 180);
};

(function () {
  const modal = document.getElementById("note-modal");
  if (!modal) return;
  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest("[data-close]")) window.closeNote();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") window.closeNote();
  });
})();
