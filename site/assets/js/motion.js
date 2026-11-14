// johnha.info — GSAP motion layer: smooth scrolling (mouse/trackpad devices) and the Home intro.
// Optional: the inline loader in <head> fetches GSAP + this file only where they are used (smooth scrolling on
// fine pointers; the Home and Contact intros; the About write-on), never under reduced motion. Without GSAP the page scrolls natively.
// Ordered dynamic scripts can run before the body is parsed, so the work waits for the DOM.
const motion = () => {
  const { gsap, ScrollTrigger, ScrollSmoother } = window;
  if (!gsap) return;
  if (ScrollTrigger && ScrollSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  const root = document.documentElement;
  const mm = gsap.matchMedia();

  /* ---------- Smooth scrolling: desktop pointers only, never on touch or reduced motion ---------- */
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
    if (!ScrollTrigger || !ScrollSmoother) return;
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
    const glideTo = (target, smooth) => smoother.scrollTo(target === 0 ? 0 : smoother.offset(target, offset()), smooth);
    const targetOf = (hash) => {
      const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (!el) return null; // "#" or an unknown id: leave the click to the browser
      return content.contains(el) ? el : 0; // #top (the body) scrolls to 0
    };

    // The page behind the search palette or the open mobile menu stays still (GSAP docs: pause for modals).
    const overlays = [document.querySelector("[data-search]"), document.querySelector("[data-nav]")].filter(Boolean);
    const syncPause = () => smoother.paused(overlays.some((el) => el.open || el.hasAttribute("data-open")));
    const watcher = new MutationObserver(syncPause);
    overlays.forEach((el) => watcher.observe(el, { attributes: true, attributeFilter: ["open", "data-open"] }));

    // Deep links (e.g. /tech/#join-order) land under the header, not behind it.
    const initial = targetOf(location.hash);
    if (initial) glideTo(initial, false);

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
      syncPause(); // unpause now, not on the observer's next tick, so the glide isn't cut short
      glideTo(target, true);
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      watcher.disconnect();
      smoother.kill();
      root.classList.remove("is-smooth");
      wrapper.before(...content.children);
      wrapper.remove();
    };
  });

  /* ---------- Home intro (start state comes from html.motion-intro, set in <head>) ---------- */
  const { SplitText, ScrambleTextPlugin } = window;
  if (SplitText) gsap.registerPlugin(SplitText);
  if (ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);
  const intro = root.classList.contains("motion-intro");
  const late = performance.now() > 1400; // the CSS safety net (1.5s) has already shown everything
  const motionOK = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const $ = (s) => document.querySelector(s);

  // Home heading: split into chars (aria "auto" keeps the full text on the h1's aria-label).
  const title = $(".page-home .hero__title");
  const grad = title?.querySelector(".gradient-text");
  let chars = [];
  let moving = 0; // letters currently replaying their entrance
  let setSplit = () => {};
  if (title && motionOK && SplitText) {
    chars = SplitText.create(title, { type: "words,chars", tag: "span", wordsClass: "word", charsClass: "char", aria: "auto" }).chars;
    // While letters move, each char of "John's Portfolio!" paints its own slice of the line's gradient
    // (the parent's clip would leave a ghost under transformed chars). At rest the parent paints the
    // line in one go again: 17 separately clipped gradients made scrolling drop frames.
    const gradChars = chars.filter((c) => grad.contains(c));
    const offset = (el) => { let x = 0; for (; el && el !== grad; el = el.offsetParent) x += el.offsetLeft; return x; };
    setSplit = (on) => {
      grad.classList.toggle("is-split", on); // first: .is-split makes grad the chars' offsetParent
      if (!on) return;
      grad.style.setProperty("--gw", grad.offsetWidth + "px");
      gradChars.forEach((c) => c.style.setProperty("--cx", offset(c) + "px"));
    };
  }

  // Each letter gets its own entrance, from a fixed hand-picked cycle (neighbours never share a move).
  // Letters stay upright: no rotation, no overshoot. Words are masks, so rise/drop come from outside the line.
  const MOVES = [
    { yPercent: 100 },                               // rise from below
    { scale: 0 },                                    // pop
    { yPercent: -100 },                              // drop from above
    { scaleY: 0, transformOrigin: "50% 100%" },      // vertical stretch
    { xPercent: -60, opacity: 0 },                   // slide in from the left
    { scaleX: 0 },                                   // horizontal stretch
  ];
  // Two letters start as a small emerald shape and become the letter: the "o" in "Welcome" (circle),
  // the "o" in "to" (square). Their glyph sits in an inner span so the shape can shrink while it grows.
  const shapes = new Map();
  if (chars.length) [[4, ""], [8, "is-square"]].forEach(([i, cls]) => {
    const c = chars[i];
    if (!c || c.textContent !== "o") return;
    c.classList.add("is-shape", ...(cls ? [cls] : []));
    c.innerHTML = `<span class="glyph">${c.textContent}</span>`;
    shapes.set(c, c.firstChild);
  });
  const entrance = (c, i, dur) => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    const glyph = shapes.get(c);
    if (glyph) {
      tl.fromTo(c, { "--s": 0 }, { "--s": 1, duration: dur * 0.35, ease: "power4.out" })
        .to(c, { "--s": 0, duration: dur * 0.5, ease: "power2.in" }, dur * 0.35)
        .fromTo(glyph, { scale: 0 }, { scale: 1, duration: dur * 0.65, clearProps: "transform" }, dur * 0.35);
    } else {
      tl.from(c, { ...MOVES[i % MOVES.length], duration: dur, clearProps: "transform,opacity" });
    }
    return tl;
  };

  // Home entrance: letters land left to right; the portrait pops in straight from a visible state.
  if (intro && !late && title) {
    // One-shot timing, so a plain media query is enough (no re-run on resize).
    const phone = matchMedia("(max-width: 47.99rem)").matches;
    const DUR = phone ? 0.4 : 0.45, EACH = phone ? 0.024 : 0.035; // 25 letters: done by ~0.98s phone, ~1.29s desktop
    const landed = (chars.length - 1) * EACH + DUR;
    setSplit(true);
    const tl = gsap.timeline()
      .fromTo(".hero__portrait", { scale: 0.9 }, { scale: 1, duration: 0.7, ease: "power4.out", clearProps: "transform" }, 0)
      // The swash draws under "John’s Portfolio!" at a calm hand-drawn pace once the letters have landed, and stays.
      // autoRound: false — the path uses pathLength="1", so GSAP's default px rounding snapped 1 -> 0 mid-tween (a pop, not a draw).
      .fromTo(".swash path", { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut", autoRound: false, clearProps: "strokeDashoffset" }, landed - 0.05)
      .fromTo(".socials", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", clearProps: "opacity" }, landed + 0.35);
    // Subtitle items decode left to right. Screen readers keep the real text (made transparent, so it also
    // holds the final width); the scramble runs in an aria-hidden overlay that is removed when it settles.
    const sub = $(".page-home .hero__subtitle");
    gsap.set(sub, { opacity: 0 });
    tl.set(sub, { clearProps: "opacity" }, landed);
    sub.querySelectorAll(":scope > span:not(.dot)").forEach((item, i) => {
      const text = item.textContent;
      if (!ScrambleTextPlugin) return;
      const fx = document.createElement("span");
      fx.className = "scramble";
      fx.setAttribute("aria-hidden", "true");
      item.classList.add("is-decoding");
      item.append(fx);
      tl.to(fx, {
        duration: 0.55,
        ease: "none",
        scrambleText: { text, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", oldClass: "noise", revealDelay: 0.1, tweenLength: false, speed: 0.6 },
        onComplete: () => { fx.remove(); item.classList.remove("is-decoding"); },
      }, landed + i * 0.12);
    });
    chars.forEach((c, i) => tl.add(entrance(c, i, DUR), i * EACH));
    // Once every letter has landed the parent paints the line again, and one emerald light band sweeps
    // across it (one element's background-position, so no per-char style work).
    if (chars.length) tl.call(() => moving || setSplit(false), null, landed)
      .fromTo(grad, { backgroundPosition: "100% 0%, 0% 0%" }, { backgroundPosition: "0% 0%, 0% 0%", duration: 0.5, ease: "power2.inOut", clearProps: "backgroundPosition" }, landed);
  }

  // Home, desktop pointers: the portrait tilts toward the pointer (max 4deg); hovering a letter replays its own entrance.
  mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const portrait = $(".page-home .hero__portrait");
    if (!portrait) return;
    const frame = portrait.querySelector(".frame");
    gsap.set(frame, { transformPerspective: 800 });
    const rx = gsap.quickTo(frame, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(frame, "rotationY", { duration: 0.5, ease: "power3.out" });
    const tilt = (e) => {
      const r = frame.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(((e.clientY - r.top) / r.height - 0.5) * -8);
    };
    const level = () => { rx(0); ry(0); };
    const replaying = new WeakMap();
    const replay = (e) => {
      const c = e.target.closest?.(".char");
      if (!c || replaying.get(c)?.isActive() || gsap.isTweening(c)) return;
      if (!moving++) setSplit(true);
      replaying.set(c, entrance(c, chars.indexOf(c), 0.35).eventCallback("onComplete", () => --moving || setSplit(false)));
    };
    portrait.addEventListener("pointermove", tilt);
    portrait.addEventListener("pointerleave", level);
    title.addEventListener("pointerover", replay);
    return () => {
      portrait.removeEventListener("pointermove", tilt);
      portrait.removeEventListener("pointerleave", level);
      title.removeEventListener("pointerover", replay);
      gsap.set(frame, { clearProps: "transform" });
    };
  });

  // Contact: each glyph of "Let's talk." (Google Sans outlines, one path each) starts as a small solid emerald shape
  // (circle, rounded square, pill in turn; the apostrophe and the full stop as dots) centered on its letter,
  // and morphs into the letter left to right while the fill eases to the heading colour. Upright, once.
  const { MorphSVGPlugin } = window;
  const morph = $(".page-contact .morph");
  if (morph && intro && !late && MorphSVGPlugin) {
    gsap.registerPlugin(MorphSVGPlugin);
    const phone = matchMedia("(max-width: 47.99rem)").matches;
    const DUR = phone ? 0.55 : 0.7, EACH = phone ? 0.045 : 0.05; // 10 glyphs: ~0.96s phone, ~1.15s desktop
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    const ink = getComputedStyle(morph).color; // the heading colour (fill is currentColor)
    // Rounded rectangle as path data (r = corner radius), so every start shape is a single closed path.
    const box = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
    const tl = gsap.timeline({ defaults: { duration: DUR, ease: "power3.inOut" } });
    [...morph.querySelectorAll("path")].forEach((p, i) => {
      const letter = p.getAttribute("d");
      const b = p.getBBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const s = Math.sqrt(b.width * b.height) * 0.6; // about the glyph’s visual size
      const dot = b.height < 300; // apostrophe and full stop
      const [w, h, r] = dot ? [s, s, s / 2] : [[s, s, s / 2], [s, s, s * 0.22], [s * 0.55, s, s * 0.275]][i % 3];
      p.setAttribute("d", box(cx - w / 2, cy - h / 2, w, h, r));
      tl.fromTo(p, { fill: accent }, { morphSVG: { shape: letter, shapeIndex: "auto" }, fill: ink, clearProps: "fill" }, i * EACH);
    });
  }

  // About: the intro writes itself on as if by pen, left to right, line after line, once, at a constant pen
  // speed (~110 characters/s, so ~3.9s for the paragraph at any width). No DOM split: one mask layer per line
  // box with a soft leading edge, so screen readers, <strong> and the line breaks are untouched (no layout shift).
  const note = $(".page-about .intro");
  // Late scripts: the safety net may have shown it already; replay only if the visitor can't have seen it yet.
  if (note && intro && motionOK && !(late && note.getBoundingClientRect().top < innerHeight)) {
    const show = () => { note.style.opacity = note.style.mask = note.style.webkitMask = ""; };
    note.style.opacity = 0; // holds the CSS start state once html.motion-intro goes
    // Lines are measured in the final fonts, so wait for them (capped so a stalled font can't hide the text).
    let fontsIn = false;
    const font = Promise.race([document.fonts.ready.then(() => (fontsIn = true)), new Promise((r) => setTimeout(r, 2500))]);
    const write = () => {
      if (!fontsIn) return show(); // a late font swap would move the lines: just show it
      // ponytail: lines are measured once; a resize during the ~4s write misplaces the bands until it ends.
      const cs = getComputedStyle(note), lh = parseFloat(cs.lineHeight), soft = parseFloat(cs.fontSize);
      const box = note.getBoundingClientRect(), range = document.createRange();
      range.selectNodeContents(note);
      const lines = []; // right edge of each line's text, px from the paragraph's left
      for (const r of range.getClientRects()) {
        const i = Math.floor(((r.top + r.bottom) / 2 - box.top) / lh);
        lines[i] = Math.max(lines[i] || 0, r.right - box.left);
      }
      const pen = { x: 0 };
      const paint = () => {
        let left = pen.x; // pen travel left over for this line
        note.style.mask = note.style.webkitMask = [...lines].map((w = 0, i) => {
          const x = Math.min(Math.max(left, 0), w + soft);
          left -= w + soft;
          return `linear-gradient(90deg,#000 ${x - soft}px,transparent ${x}px) 0 ${i * lh}px/100% ${lh}px no-repeat`;
        }).join();
      };
      paint();
      note.style.opacity = "";
      const travel = lines.reduce((a, w = 0) => a + w + soft, 0);
      gsap.to(pen, { x: travel, duration: note.textContent.trim().length / 110, ease: "none", onUpdate: paint, onComplete: show });
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      font.then(write);
    }, { threshold: 0.3 });
    io.observe(note);
  }

  // GSAP now holds every start state inline, so the CSS one (and its safety net) can go.
  root.classList.remove("motion-intro");
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", motion);
else motion();
