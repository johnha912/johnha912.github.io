// Motion is an enhancement only. Every helper is a no-op when GSAP did not load or the visitor
// prefers reduced motion, and nothing is ever hidden until an animation finishes.
// GSAP 3.13.0 core is loaded (deferred) from cdn.jsdelivr.net in index.html.

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const gs = () => (!reduced.matches && window.gsap) ? window.gsap : null;

// A new chat message or card settles into place.
export function settleIn(el) {
  const g = gs();
  if (!g || !el) return;
  g.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", clearProps: "opacity,transform" });
}

// A proposal card changed state (vote recorded, applied, rejected).
export function stateChanged(el) {
  const g = gs();
  if (!g || !el) return;
  g.fromTo(el, { scale: 0.985, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)", clearProps: "opacity,transform" });
}

// The pending-confirmation strip appears above the table.
export function stripIn(el) {
  const g = gs();
  if (!g || !el) return;
  g.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "opacity,transform" });
}

// Back-to-top button: show/hide. Without GSAP it simply toggles `hidden`.
export function showButton(el) {
  el.hidden = false;
  const g = gs();
  if (g) g.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "opacity,transform" });
}
export function hideButton(el) {
  const g = gs();
  if (!g) { el.hidden = true; return; }
  g.to(el, { opacity: 0, y: 12, duration: 0.2, ease: "power2.in", onComplete: () => { el.hidden = true; g.set(el, { clearProps: "opacity,transform" }); } });
}

export function smoothScrollTop() {
  window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
}
