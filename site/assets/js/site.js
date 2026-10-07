// johnha.info — small progressive enhancements. The site works without this file.
(() => {
  const root = document.documentElement;
  root.classList.add("js");

  /* ---------- Theme: Light / Dark / System (remembered per device) ---------- */
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const themeList = document.getElementById("theme-options");
  const systemLight = matchMedia("(prefers-color-scheme: light)");
  const applyTheme = (pref) => {
    root.dataset.themePref = pref;
    root.dataset.theme = pref === "system" ? (systemLight.matches ? "light" : "dark") : pref;
    themeBtn?.setAttribute("aria-label", `Theme: ${pref[0].toUpperCase() + pref.slice(1)}`);
    themeList?.querySelectorAll("[data-set-theme]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.setTheme === pref)));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", root.dataset.theme === "light" ? "#f6f5f3" : "#0a0a0b");
  };
  const setThemeMenu = (open) => {
    if (!themeList) return;
    themeList.hidden = !open;
    themeBtn.setAttribute("aria-expanded", String(open));
    if (open) (themeList.querySelector('[aria-checked="true"]') || themeList.querySelector("button")).focus();
  };
  applyTheme(root.dataset.themePref || "system");
  systemLight.addEventListener("change", () => root.dataset.themePref === "system" && applyTheme("system"));
  themeBtn?.addEventListener("click", () => setThemeMenu(themeList.hidden));
  themeList?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-set-theme]");
    if (!b) return;
    applyTheme(b.dataset.setTheme);
    try { localStorage.setItem("theme", b.dataset.setTheme); } catch {}
    setThemeMenu(false);
    themeBtn.focus();
  });
  themeList?.addEventListener("keydown", (e) => {
    const items = [...themeList.querySelectorAll("button")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === "Tab") setThemeMenu(false);
  });
  document.addEventListener("click", (e) => {
    if (themeList && !themeList.hidden && !e.target.closest("[data-theme-menu]")) setThemeMenu(false);
  });

  /* ---------- Mobile menu ---------- */
  const nav = document.querySelector("[data-nav]");
  const burger = document.querySelector("[data-burger]");
  const setMenu = (open) => {
    nav.toggleAttribute("data-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => setMenu(!nav.hasAttribute("data-open")));
  matchMedia("(min-width: 48rem)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------- Coffee Blog dropdown (click/keyboard; hover handled in CSS) ---------- */
  document.querySelectorAll(".has-menu").forEach((item) => {
    const toggle = item.querySelector(".submenu-toggle");
    const set = (open) => {
      item.toggleAttribute("data-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => set(!item.hasAttribute("data-open")));
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    document.addEventListener("click", (e) => { if (!item.contains(e.target)) set(false); });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (themeList && !themeList.hidden) { setThemeMenu(false); themeBtn.focus(); }
    if (nav?.hasAttribute("data-open")) { setMenu(false); burger.focus(); }
    document.querySelectorAll(".has-menu[data-open]").forEach((m) => {
      m.removeAttribute("data-open");
      m.querySelector(".submenu-toggle").setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Site search (command palette over a static index) ---------- */
  const PAGES = [
    { t: "Home", u: "/", s: "Page", k: "welcome portfolio john ha" },
    { t: "About Me", u: "/about/", s: "Page", k: "education northeastern worldquant suffolk ueh certificate ibm badge credly marketing market research financial engineering" },
    { t: "Projects", u: "/tech/", s: "Tech", k: "tech skills python sql pandas numpy streamlit dbt airflow postgres pgvector" },
    { t: "Product Analytics ELT Pipeline", u: "/tech/#elt-pipeline", s: "Tech · Featured", k: "dbt airflow star schema warehouse dashboard ingestion metrics" },
    { t: "OmniRAG Data Platform Upgrade", u: "/tech/#omnirag-upgrade", s: "Tech · Featured", k: "postgres pgvector lineage data quality eval ingestion" },
    { t: "JOIN Order Optimization", u: "/tech/#join-order", s: "Tech · Earlier work", k: "dynamic programming matrix chain sql sqlite query optimizer algorithms cs 5800" },
    { t: "OmniRAG (team project)", u: "/tech/#omnirag", s: "Tech · Earlier work", k: "rag java spring boot retrieval augmented generation" },
    { t: "jivec compiler", u: "/tech/#jivec", s: "Tech · Earlier work", k: "c compiler x86-64 nasm assembly jive cs 5008" },
    { t: "Coffee Blog", u: "/coffee-blog/", s: "Coffee", k: "coffee lover brew guides recipes" },
    { t: "Pour Over / Flash Brew", u: "/coffee-blog/pour-over-flash-brew/", s: "Coffee", k: "v60 japanese iced coffee bloom pour" },
    { t: "AeroPress", u: "/coffee-blog/aeropress/", s: "Coffee", k: "inverted immersion pressure" },
    { t: "Espresso", u: "/coffee-blog/espresso/", s: "Coffee", k: "tds crema pressure tamp shot" },
    { t: "Vietnamese Phin", u: "/coffee-blog/vietnamese-phin/", s: "Coffee", k: "ca phe sua da condensed milk robusta" },
    { t: "Contact", u: "/contact/", s: "Page", k: "email linkedin github instagram hire internship" },
    { t: "Music on SoundCloud", u: "https://soundcloud.com/johnhamusic", s: "External", k: "music soundcloud" },
    { t: "Photography on Instagram", u: "https://www.instagram.com/johnha.ns/", s: "External", k: "photography photos instagram" },
  ];
  const dialog = document.querySelector("[data-search]");
  const input = dialog?.querySelector("input");
  const list = dialog?.querySelector("[data-search-results]");
  let active = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = PAGES.filter((p) => {
      const hay = `${p.t} ${p.s} ${p.k}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    active = 0;
    list.innerHTML = hits.length
      ? hits.map((p, i) => `<li><a href="${p.u}" id="sr-${i}" role="option" aria-selected="${i === 0}"${p.u.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><span class="r-title">${p.t}</span><span class="r-section">${p.s}</span></a></li>`).join("")
      : `<li class="search__empty">No results for “${q.replace(/[<>&"]/g, "")}”</li>`;
    input.setAttribute("aria-activedescendant", hits.length ? "sr-0" : "");
  };
  const move = (d) => {
    const items = [...list.querySelectorAll("a")];
    if (!items.length) return;
    items[active].setAttribute("aria-selected", "false");
    active = (active + d + items.length) % items.length;
    items[active].setAttribute("aria-selected", "true");
    items[active].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", items[active].id);
  };
  const openSearch = () => {
    if (!dialog) return;
    if (nav?.hasAttribute("data-open")) setMenu(false);
    input.value = "";
    render();
    dialog.showModal();
    input.focus();
  };

  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
  input?.addEventListener("input", render);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    if (e.key === "Enter") { e.preventDefault(); list.querySelectorAll("a")[active]?.click(); }
  });
  dialog?.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      e.preventDefault();
      dialog?.open ? dialog.close() : openSearch();
    }
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Spotlight that follows the pointer on the home button stack ---------- */
  document.querySelectorAll(".stack__btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
      btn.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("span");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = "Copied!";
      } catch {
        label.textContent = "Copy failed";
      }
      setTimeout(() => { label.textContent = "Copy"; }, 1800);
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
