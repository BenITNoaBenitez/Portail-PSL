/* ============ Application Documentation WIPSOS ============ */
(function () {
  "use strict";

  const menuEl    = document.getElementById("menu");
  const docEl     = document.getElementById("doc");
  const searchEl  = document.getElementById("searchInput");
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("overlay");
  const toggleBtn = document.getElementById("menuToggle");

  document.getElementById("year").textContent = new Date().getFullYear();

  // Normalise une catégorie en liste de sous-groupes [{ name, items }]
  function groupsOf(cat) {
    if (cat.groups) return cat.groups;
    return [{ name: null, items: cat.items || [] }];
  }

  // Première formation disponible (pour la route par défaut)
  function firstItemId() {
    for (const cat of DOC) {
      for (const g of groupsOf(cat)) {
        if (g.items && g.items.length) return g.items[0].id;
      }
    }
    return "";
  }

  // Index plat de tous les articles : id -> { item, category, group }
  const index = {};
  DOC.forEach(cat => groupsOf(cat).forEach(g => {
    (g.items || []).forEach(item => {
      index[item.id] = { item, category: cat.category, group: g.name };
    });
  }));

  /* ---------- Construction du menu ---------- */
  function buildMenu(filter) {
    const q = (filter || "").trim().toLowerCase();
    menuEl.innerHTML = "";
    let anyResult = false;

    const matches = (it, cat) =>
      !q || (it.title + " " + (it.lead || "") + " " + cat.category)
        .toLowerCase().includes(q);

    const makeItemLink = (it) => {
      const a = document.createElement("a");
      a.className = "menu-item";
      a.href = "#" + it.id;
      a.dataset.id = it.id;
      a.textContent = it.title;
      a.addEventListener("click", e => {
        e.preventDefault();
        navigate(it.id);
        closeSidebarMobile();
      });
      return a;
    };

    DOC.forEach((cat) => {
      // Sous-groupes filtrés selon la recherche
      const groups = groupsOf(cat)
        .map(g => ({ name: g.name, items: (g.items || []).filter(it => matches(it, cat)) }))
        .filter(g => g.items.length > 0);
      if (groups.length === 0) return;
      anyResult = true;

      const catEl = document.createElement("div");
      catEl.className = "menu-category";

      const titleEl = document.createElement("div");
      titleEl.className = "menu-category-title";
      titleEl.innerHTML =
        '<span class="cat-icon">' + (cat.icon || "📁") + "</span>" +
        "<span>" + cat.category + "</span>" +
        '<span class="chevron">▼</span>';
      titleEl.addEventListener("click", () => catEl.classList.toggle("collapsed"));
      catEl.appendChild(titleEl);

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "menu-items";
      groups.forEach(g => {
        if (g.name) {
          const groupTitle = document.createElement("div");
          groupTitle.className = "menu-subgroup";
          groupTitle.textContent = g.name;
          itemsWrap.appendChild(groupTitle);
        }
        g.items.forEach(it => itemsWrap.appendChild(makeItemLink(it)));
      });
      catEl.appendChild(itemsWrap);
      menuEl.appendChild(catEl);
    });

    if (!anyResult) {
      menuEl.innerHTML =
        '<p style="padding:14px;color:#8b909a;font-size:14px;">Aucun résultat.</p>';
    }
    highlightActive();
  }

  /* ---------- Lien horodaté selon la plateforme ---------- */
  // Construit l'URL qui démarre la lecture à "t" secondes, en s'adaptant
  // automatiquement à la plateforme (YouTube ou SharePoint/Stream).
  function videoUrlAt(base, t) {
    if (/youtu\.be|youtube\.com/i.test(base)) {
      // YouTube : ...?t=SECONDS  (ex. https://youtu.be/ID?t=424)
      const sep = base.includes("?") ? "&" : "?";
      return base + sep + "t=" + t;
    }
    // SharePoint/Stream : nav -> playbackOptions.startTimeInSeconds
    const nav = encodeURIComponent(JSON.stringify({ playbackOptions: { startTimeInSeconds: t } }));
    const sep = base.includes("?") ? "&" : "?";
    return base + sep + "nav=" + nav;
  }

  // Formate des secondes en M:SS ou H:MM:SS (pour les minutages > 1 h).
  function formatTime(t) {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = String(t % 60).padStart(2, "0");
    return h > 0 ? h + ":" + String(m).padStart(2, "0") + ":" + s : m + ":" + s;
  }

  /* ---------- Bouton « Voir la vidéo » ---------- */
  function videoButton(id) {
    const vid = (typeof VIDEOS !== "undefined") ? VIDEOS[id] : null;
    if (!vid || !vid.v) return "";
    const t = vid.t || 0;
    const url = videoUrlAt(vid.v, t);
    const time = formatTime(t);
    return (
      '<a class="video-btn" href="' + url + '" target="_blank" rel="noopener">' +
        '<span class="video-ic">▶</span>' +
        '<span>Voir la vidéo de formation</span>' +
        '<span class="video-time">' + time + "</span>" +
      "</a>"
    );
  }

  /* ---------- Affichage d'un article ---------- */
  function render(id) {
    const entry = index[id];
    if (!entry) {
      docEl.innerHTML = "<h1>Page introuvable</h1><p>Sélectionnez une formation dans le menu.</p>";
      return;
    }
    const { item, category } = entry;
    docEl.innerHTML =
      '<div class="doc-breadcrumb">' + category +
        '<span class="sep">/</span><span class="current">' + item.title + "</span></div>" +
      "<h1>" + item.title + "</h1>" +
      (item.lead ? '<p class="lead">' + item.lead + "</p>" : "") +
      videoButton(id) +
      item.html;
    document.title = item.title + " — Documentation WIPSOS";
    docEl.parentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function highlightActive() {
    const current = location.hash.replace("#", "");
    menuEl.querySelectorAll(".menu-item").forEach(a => {
      a.classList.toggle("active", a.dataset.id === current);
    });
  }

  function navigate(id) {
    if (location.hash !== "#" + id) {
      location.hash = id; // déclenche hashchange -> route()
    } else {
      route();
    }
  }

  function route() {
    const id = location.hash.replace("#", "") || firstItemId();
    const carto = id === "cartographie" && typeof renderCartographie === "function";
    docEl.parentElement.classList.toggle("content-wide", carto);
    const cartoBtn = document.getElementById("cartoBtn");
    if (cartoBtn) cartoBtn.classList.toggle("active", carto);
    if (carto) {
      renderCartographie(docEl);
      window.scrollTo(0, 0);
    } else {
      render(id);
    }
    highlightActive();
  }

  /* ---------- Sidebar mobile ---------- */
  function openSidebarMobile() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebarMobile() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebarMobile() : openSidebarMobile();
  });
  overlay.addEventListener("click", closeSidebarMobile);

  /* ---------- Icône Cartographie ---------- */
  const cartoBtnEl = document.getElementById("cartoBtn");
  if (cartoBtnEl) {
    cartoBtnEl.addEventListener("click", e => {
      e.preventDefault();
      navigate("cartographie");
      closeSidebarMobile();
    });
  }

  /* ---------- Recherche ---------- */
  let searchTimer;
  searchEl.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => buildMenu(searchEl.value), 120);
  });

  /* ---------- Init ---------- */
  window.addEventListener("hashchange", route);
  buildMenu("");
  route();
})();
