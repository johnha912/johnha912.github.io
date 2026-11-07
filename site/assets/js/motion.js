// johnha.info — GSAP motion layer: smooth scrolling (mouse/trackpad devices) and scroll reveals.
// Optional: if GSAP fails to load, site.js keeps its own reveal and the page scrolls natively.
(() => {
  const { gsap, ScrollTrigger, ScrollSmoother } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  root.classList.add("gsap");
  const EASE = "power4.out"; // same curve as --ease-out (easeOutQuint)
  const mm = gsap.matchMedia();

  /* ---------- Smooth scrolling: desktop pointers only, never on touch or reduced motion ---------- */
  // Created first: ScrollSmoother must exist before the reveal triggers measure the page.
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
    if (!ScrollSmoother) return;
    const main = document.querySelector("main");
    if (!main) return;

    // The fixed header, ambient glow, cookie banner and search dialog stay outside the moving layer.
    const wrapper = document.createElement("div");
    const content = document.createElement("div");
    wrapper.id = "smooth-wrapper";
    content.id = "smooth-content";
    main.before(wrapper);
    wrapper.append(content);
    content.append(...document.querySelectorAll("body > main, body > .footer"));

    const smoother = ScrollSmoother.create({ wrapper, content, smooth: 1.1, effects: false });
    root.classList.add("is-smooth");
    const offset = () => `top ${parseFloat(getComputedStyle(root).scrollPaddingTop) || 0}px`;
    const targetOf = (hash) => {
      const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      return el && content.contains(el) ? el : el ? 0 : null; // #top (the body) scrolls to 0
    };

    // Deep links (e.g. /tech/#elt-pipeline) land under the header, not behind it.
    const initial = targetOf(location.hash);
    if (initial) smoother.scrollTo(initial, false, offset());

    // Same-page anchors glide instead of jumping. The skip link keeps its native focus behavior.
    const onClick = (e) => {
      const a = e.target.closest("a[href*='#']");
      if (!a || a.matches(".skip-link") || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      const target = targetOf(url.hash);
      if (target === null) return;
      e.preventDefault();
      a.closest("dialog[open]")?.close();
      smoother.scrollTo(target, true, offset());
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      smoother.kill();
      root.classList.remove("is-smooth");
      wrapper.before(...content.children);
      wrapper.remove();
    };
  });

  /* ---------- Scroll reveal: batched, staggered rise-in ---------- */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.batch("[data-reveal]:not(.is-in)", {
      start: "top 92%",
      once: true,
      onEnter: (els) => {
        els.forEach((el) => el.classList.add("is-in"));
        gsap.from(els, { opacity: 0, y: 28, duration: 0.9, ease: EASE, stagger: 0.08, clearProps: "opacity,transform" });
      },
    });

    // The home button stack spotlight trails the pointer instead of snapping to it.
    const cleanups = [...document.querySelectorAll(".stack__btn")].map((btn) => {
      gsap.set(btn, { "--mx": "0px", "--my": "0px" }); // px units for the tween (CSS default is 50%)
      const toX = gsap.quickTo(btn, "--mx", { duration: 0.45, ease: "power3.out", unit: "px" });
      const toY = gsap.quickTo(btn, "--my", { duration: 0.45, ease: "power3.out", unit: "px" });
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        // Entering snaps to the pointer; moving inside eases after it.
        e.type === "pointerenter" ? (toX(x, x), toY(y, y)) : (toX(x), toY(y));
      };
      btn.addEventListener("pointerenter", onMove);
      btn.addEventListener("pointermove", onMove);
      return () => {
        btn.removeEventListener("pointerenter", onMove);
        btn.removeEventListener("pointermove", onMove);
        gsap.set(btn, { clearProps: "--mx,--my" });
      };
    });
    return () => cleanups.forEach((off) => off());
  });
})();
