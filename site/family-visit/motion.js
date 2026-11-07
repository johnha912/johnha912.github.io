// Motion layer (GSAP 3.13: core, ScrollTrigger, Flip, SplitText, ScrollToPlugin, CustomEase).
// Enhancement only: every export is a safe no-op when GSAP (or one plugin) did not load, or the
// visitor prefers reduced motion. Only transform/opacity (and a few CSS custom properties that feed
// transforms) are animated, and nothing is ever left hidden: reveals use opacity, never visibility.

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let registered = false;

function g() {
  const gsap = window.gsap;
  if (!gsap) return null;
  if (!registered) {
    registered = true;
    try {
      const plugins = [window.ScrollTrigger, window.Flip, window.SplitText, window.ScrollToPlugin, window.CustomEase].filter(Boolean);
      if (plugins.length) gsap.registerPlugin(...plugins);
      // "liquid": a quick start that settles softly, like glass coming to rest.
      if (window.CustomEase) window.CustomEase.create("liquid", "M0,0 C0.16,0.84 0.3,1.03 0.52,1.01 0.72,0.99 0.86,1 1,1");
    } catch (e) { console.warn("[family-visit] GSAP plugins:", e); }
  }
  return gsap;
}
const on = () => !reduced.matches && g();
const has = (name) => !!window[name];
const ease = () => (has("CustomEase") ? "liquid" : "power3.out");
const safe = (fn) => (...a) => { try { return fn(...a); } catch (e) { console.warn("[family-visit] motion:", e); return undefined; } };

/* ---------- backdrop: drifting color fields + scroll parallax + reading progress ---------- */
// Every glass panel blurs whatever is behind it, so a moving backdrop makes the browser redo those
// blurs on every frame. The drift therefore runs only on fine pointers (desktop), and it holds
// still while the chat is being scrolled. Phones get the same color fields, standing still.
const coarse = matchMedia("(pointer: coarse)");
let backdropStarted = false;
const drift = [];
export const startBackdrop = safe(() => {
  const gs = on();
  if (!gs || backdropStarted) return;
  backdropStarted = true;
  if (!coarse.matches) {
    gs.utils.toArray(".orb").forEach((orb, i) => {
      drift.push(gs.to(orb, {
        x: gs.utils.random(-60, 60), y: gs.utils.random(-50, 50), scale: gs.utils.random(0.9, 1.15),
        duration: gs.utils.random(9, 14), ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.6
      }));
    });
  }
  if (has("ScrollTrigger")) {
    gs.to(".backdrop", { yPercent: -12, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 1.2 } });
    gs.fromTo(".progress-bar", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 } });
  }
});
// Called on each chat scroll event: the drift pauses, and resumes a moment after scrolling stops.
let driftTimer = null;
export const holdBackdrop = safe(() => {
  if (!drift.length) return;
  if (!driftTimer) drift.forEach((t) => t.pause());
  clearTimeout(driftTimer);
  driftTimer = setTimeout(() => { driftTimer = null; drift.forEach((t) => t.resume()); }, 1200);
});

/* ---------- entrances ---------- */
// Sign-in / denied card: rises in, title words follow.
export const gateIntro = safe((card) => {
  const gs = on();
  if (!gs || !card) return;
  const tl = gs.timeline({ defaults: { ease: ease() } });
  tl.fromTo(card, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, clearProps: "opacity,transform" });
  const title = card.querySelector(".gate-brand");
  if (title && has("SplitText")) {
    const split = new window.SplitText(title, { type: "words", aria: "auto" });
    tl.from(split.words, { opacity: 0, y: 14, duration: 0.6, stagger: 0.06, onComplete: () => split.revert() }, 0.15);
  }
});

// The board: header glass drops in, title words rise, the sections follow in reading order.
let boardIntroDone = false;
export const boardIntro = safe(() => {
  const gs = on();
  if (!gs || boardIntroDone) return;
  boardIntroDone = true;
  const tl = gs.timeline({ defaults: { ease: ease() } });
  tl.fromTo("header.title", { opacity: 0, y: -24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, clearProps: "opacity,transform" });
  const title = document.querySelector("#trip-title");
  if (title && has("SplitText")) {
    const split = new window.SplitText(title, { type: "words", aria: "auto" });
    tl.from(split.words, { opacity: 0, yPercent: 60, duration: 0.7, stagger: 0.05, onComplete: () => split.revert() }, 0.1);
  }
  const inView = [...document.querySelectorAll("#plan, #chat, #details")].filter((n) => n.getBoundingClientRect().top < innerHeight);
  if (inView.length) tl.fromTo(inView, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, clearProps: "opacity,transform" }, 0.25);
  const below = [...document.querySelectorAll("#plan, #chat, #details")].filter((n) => !inView.includes(n));
  reveal(below);
});

// Cards that are below the fold rise in when scrolled to (opacity only, so they stay usable).
const revealTriggers = new Set();
export const reveal = safe((nodes) => {
  const gs = on();
  const list = [...(nodes || [])].filter(Boolean);
  if (!gs || !list.length || !has("ScrollTrigger")) return;
  const below = list.filter((n) => n.getBoundingClientRect().top > innerHeight * 0.92);
  if (!below.length) return;
  gs.set(below, { opacity: 0, y: 32 });
  const triggers = window.ScrollTrigger.batch(below, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gs.to(batch, { opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: ease(), clearProps: "opacity,transform" })
  });
  triggers.forEach((t) => revealTriggers.add(t));
});

/* ---------- reactions to what people do ---------- */
export const settleIn = safe((el) => {
  const gs = on();
  if (!gs || !el) return;
  gs.fromTo(el, { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.6)", clearProps: "opacity,transform" });
});

export const stateChanged = safe((el) => {
  const gs = on();
  if (!gs || !el) return;
  gs.fromTo(el, { scale: 0.97, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.55)", clearProps: "opacity,transform" });
});

export const stripIn = safe((el) => {
  const gs = on();
  if (!gs || !el) return;
  gs.fromTo(el, { opacity: 0, y: -14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: ease(), clearProps: "opacity,transform" });
});

// Rows a proposal just changed glow once (a custom property feeds the row's tint).
export const flashRows = safe((rows) => {
  const gs = on();
  if (!gs) return;
  rows.filter(Boolean).forEach((tr) => gs.fromTo(tr, { "--flash": 1 }, { "--flash": 0, duration: 2.2, ease: "power2.out" }));
});

// Buttons give a little under the finger, then spring back.
export const press = safe((el) => {
  const gs = on();
  if (!gs || !el) return;
  gs.to(el, { scale: 0.94, duration: 0.12, ease: "power2.out", overwrite: "auto" });
});
export const release = safe((el) => {
  const gs = on();
  if (!gs || !el) return;
  gs.to(el, { scale: 1, duration: 0.7, ease: "elastic.out(1.1, 0.45)", overwrite: "auto", clearProps: "transform" });
});

// The glass highlight follows the pointer on desktop (sets --sx / --sy on the element).
const sheenSetters = new WeakMap();
export const sheen = safe((el, x, y) => {
  const gs = on();
  if (!gs || !el) return;
  let s = sheenSetters.get(el);
  if (!s) {
    // Unitless numbers (percent of the element); the CSS multiplies them by 1%.
    gs.set(el, { "--sx": x, "--sy": y });
    s = { x: gs.quickTo(el, "--sx", { duration: 0.35, ease: "power3.out" }), y: gs.quickTo(el, "--sy", { duration: 0.35, ease: "power3.out" }) };
    sheenSetters.set(el, s);
  }
  s.x(x); s.y(y);
});

/* ---------- layout changes (Flip) ---------- */
// Expanding or collapsing a decision card: the card grows and everything below glides into place.
export const flipLayout = safe((targetsSelector, change) => {
  const gs = on();
  if (!gs || !has("Flip")) { change(); return; }
  const state = window.Flip.getState(targetsSelector);
  change();
  window.Flip.from(state, {
    duration: 0.55, ease: ease(), nested: true, prune: true,
    onEnter: (els) => gs.fromTo(els, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, clearProps: "opacity,transform" }),
    onComplete: () => window.ScrollTrigger?.refresh()
  });
});

/* ---------- floating section bar ---------- */
export const showDock = safe((dock) => {
  dock.hidden = false;
  const gs = on();
  if (gs) gs.fromTo(dock, { opacity: 0, y: -24, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: ease(), clearProps: "opacity,transform" });
});
export const hideDock = safe((dock) => {
  const gs = on();
  if (!gs) { dock.hidden = true; return; }
  gs.to(dock, { opacity: 0, y: -24, scale: 0.94, duration: 0.3, ease: "power2.in", onComplete: () => { dock.hidden = true; gs.set(dock, { clearProps: "opacity,transform" }); } });
});
// The liquid pill under the active section link slides to its new place.
export const moveIndicator = safe((indicator, link) => {
  if (!indicator || !link) return;
  const x = link.offsetLeft;
  const w = link.offsetWidth;
  const gs = on();
  if (gs) gs.to(indicator, { x, width: w, opacity: 1, duration: 0.5, ease: ease() });
  else { indicator.style.transform = `translateX(${x}px)`; indicator.style.width = `${w}px`; indicator.style.opacity = "1"; }
});

/* ---------- back-to-top button ---------- */
export function showButton(el) {
  el.hidden = false;
  const gs = on();
  if (gs) gs.fromTo(el, { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)", clearProps: "opacity,transform" });
}
export function hideButton(el) {
  const gs = on();
  if (!gs) { el.hidden = true; return; }
  gs.to(el, { opacity: 0, y: 14, scale: 0.9, duration: 0.2, ease: "power2.in", onComplete: () => { el.hidden = true; gs.set(el, { clearProps: "opacity,transform" }); } });
}

/* ---------- scrolling ---------- */
// Scrolls the page so `target` (element or y) sits `offset` px below the top.
export function scrollTo(target, offset = 0) {
  const gs = on();
  if (gs && has("ScrollToPlugin")) {
    try {
      gs.to(window, { scrollTo: { y: target, offsetY: offset, autoKill: true }, duration: 0.9, ease: "power3.inOut" });
      return;
    } catch { /* fall through */ }
  }
  const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY - offset;
  window.scrollTo({ top: y, behavior: reduced.matches ? "auto" : "smooth" });
}
export function smoothScrollTop() { scrollTo(0, 0); }

export const refresh = safe(() => { if (g() && has("ScrollTrigger")) window.ScrollTrigger.refresh(); });
