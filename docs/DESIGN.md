# DESIGN.md: johnha.info design system

Source of truth for tokens and components. Implementation: `site/assets/css/site.css` (tokens at the top, components below). Every page consumes these tokens; no one-off values in page code.

**Design read:** a developer/data-engineering portfolio for recruiters and hiring managers, often opened on a phone. The language is calm, Tesla-like minimalism: neutral near-black or warm off-white, one emerald-green accent, large tight display type, and photos in soft squircle frames. Coffee pages add a warm "crema" tint as section seasoning.

## 1. Themes

- Two modes, **Dark** (default) and **Light**, switched by one header button. The device's system setting is ignored. The choice is saved per device in `localStorage("theme")`.
- `<html data-theme="light|dark">` is the active theme. An inline script in `<head>` resolves it before first paint, so there is no flash.
- With JavaScript off, the site renders in dark (the design's primary mode).

## 2. Color tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0a0a0b` | `#f6f5f3` | Page background |
| `--bg-elev` | `#121215` | `#ffffff` | Menus, dialogs, diagram panels |
| `--surface` / `--surface-2` / `--surface-hover` | white 3.5% / 6.5% / 9% | black 2.5% / 4.5% / 6.5% | Cards, chips, hover fills |
| `--border` / `--border-strong` | white 9% / 16% | black 8% / 14% | Hairlines |
| `--text` | `#f4f4f5` | `#111113` | Primary text |
| `--text-muted` | `#a8a8b1` | `#4f4f57` | Body copy, descriptions |
| `--text-faint` | `#8a8a93` | `#66666e` | Labels, metadata (≥ 4.5:1 on `--bg`) |
| `--accent` | `#34d399` | `#047857` | The single accent (emerald green): links, current state, focus ring, hover fills |
| `--accent-strong` | `#10b981` | `#059669` | Portrait halo |
| `--accent-2` | `#bef264` | `#4d7c0f` | Lime end of the hero gradient text and halo only |
| `--band` | `#141417` | `#ffffff` | Alternate article chapter surface (Coffee brew guides only) |
| `--band-warm` | `color-mix(in oklab, var(--crema) 8%, var(--bg))` | same mix at 7% | The one warm chapter per article |
| `--crema` | `#e9a35b` | `#a3561a` | Coffee art glow, the warm article band, and status dots only |
| `--success` | `#4ade80` | `#15803d` | "Open to internships" live dot only |

Ambient background: two very soft radial glows (accent and crema) plus a 3-5% film-grain layer. No blue anywhere (owner decision 2026-10-07) on a fixed, `pointer-events: none` element.

## 3. Typography

- **Google Sans** variable (weight 400-700), self-hosted WOFF2 with latin and Vietnamese subsets (owner decision 2026-11-13, replacing Inter, which is overused by AI-built sites). Identical rendering on every device; no reliance on system fonts.
- **Google Sans Code** variable (weight 400-700) for small technical labels (chips, dates, diagram notes). `ss01` is on site-wide (single-storey g in Google Sans Code).

| Token | Size | Use |
|---|---|---|
| `--fs-display` | clamp(2.75rem → 6.25rem) | Home hero, Contact hero |
| `--fs-3xl` | clamp(2.25rem → 4rem) | Page H1 |
| `--fs-2xl` | clamp(1.75rem → 2.75rem) | Section titles, project titles |
| `--fs-xl` | clamp(1.375rem → 1.75rem) | Card titles |
| `--fs-index` | clamp(2rem → 4.5rem) | Home index rows |
| `--fs-lead` | clamp(1.25rem → 1.75rem) | About intro, article ledes |
| `--fs-chapter` | clamp(2rem → 3.5rem), 32-56px | Brew article chapter titles |
| `--fs-article` | clamp(1.0625rem → 1.1875rem), 17-19px | Brew article body copy |
| `--fs-lg` / `--fs-base` / `--fs-sm` / `--fs-xs` | 1.25 / 1.0625 / 0.875 / 0.75rem | Lede / body / UI / labels (12px is the floor for any text) |

Revised 2026-11-13 from an audit of Material 3, Apple HIG, Carbon, Atlassian, Polaris, web.dev and Practical Typography. Every fluid step uses rem + vw with max/min at most 2.5.

| Token group | Values |
|---|---|
| Line height | `--lh-solid` 1 (index titles, numerals), `--lh-tight` 1.04 (display, page H1), `--lh-heading` 1.1, `--lh-snug` 1.25 (xl/lg headings), `--lh-ui` 1.4 (short UI text), `--lh-copy` 1.5 (ledes, captions, credits), `--lh-body` 1.6 (body and prose) |
| Tracking | `--tracking-display` -0.035em, `--tracking-index` -0.04em, `--tracking-tight` -0.02em, `--tracking-meta` 0.04em (12px mono meta), `--tracking-label` 0.1em (uppercase mono labels) |

Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## 4. Space, layout, radii

- Space scale (4px base): `--space-1` 4px through `--space-10` 128px. Gutter: clamp(16px → 32px). `--space-section`: clamp(64px → 96px), the vertical rhythm between page sections. `--space-chapter`: clamp(80px → 152px), the vertical padding of each brew-article chapter.
- Widths: content 72rem (`--content`); prose 36rem (`--prose`); text cap `--measure` 50ch (Google Sans 1ch is about 1.47 characters, so roughly 73 characters at any size); chart 56rem (`--prose-wide`). Brew articles (`.brew`) widen `--prose` and `--measure` to 46rem from 60rem.
- Breakpoints (mobile-first): 40rem (640px), 48rem (768px), 60rem (960px).
- Radii: `--r-xs` 8, `--r-sm` 12, `--r-md` 18, `--r-lg` 26, `--r-xl` 36 (px), `--r-pill` 999px.
- `--inset` (= `--space-2`, 8px): the gap between an object card's edge and the art inside it (Coffee cards, article hero card, pager cards, Music cards). Outer `--r-xl`, inner `--r-lg`.
- **Squircles:** elements with class `.sq` get `corner-shape: squircle` where supported (Chromium 139+), and every radius token is multiplied by `--sq: 1.65` so the smoother curve keeps the same visual roundness. Other browsers keep normal rounded corners.
- Radius rule: buttons, pills, and icon buttons are full pill; cards and photo frames use `--r-lg`/`--r-xl`; inner elements use smaller radii (nested radius = outer minus padding).

## 5. Components

| Component | Notes |
|---|---|
| Logo mark | Avatar line art as a CSS mask in a 40px circle. On hover or keyboard focus it inverts with a 320 ms ease (circle fills with `--text`, drawing turns `--bg`) while a 1.5px accent ring draws itself clockwise (animated `@property --ring`); on press it scales to 0.92 for tactile feedback. Reduced motion makes both instant. |
| Back to top | Pill button in every footer, links to `#top`; smooth scroll only when motion is allowed. |
| Article extras | Byline with author link and `Updated` date; an "At a glance" summary box (accent-tinted) at the top for quick answers; question-style H2s; an FAQ section of H3 questions; internal links to sibling guides. |
| Article figure | In-body photo in a squircle frame, caption plus a credit line (title, author, license, Wikimedia Commons). Below 60rem frames take the photo's own ratio from its width/height attributes and portrait ones cap at 26rem. Brew guides use the Chapters photo components below. |
| Chart figure | Elevated card: title, one-line subtitle, Plotly chart (lazy-loaded), "Show the data as a table" disclosure, and a source line. Ordinal green ramps validated against each theme's surface: dark `#d1fae5 #6ee7b7 #34d399 #059669`, light `#064e3b #047857 #059669 #10b981`; hairline solid crosshair; text never wears the series color. The reserved height follows the card's own width through a container query on `.chart-figure` (380px, 460px from 520px), the same input `espresso-chart.js` uses, so the chart never shifts the page when it loads. |
| Cookie consent | Glass card fixed bottom-left on desktop (30rem) and full width on mobile; cookie icon, title, short copy, privacy link; Accept all and Reject all share the same filled style (equal prominence), Customize is a text link that reveals switches (Strictly necessary locked on, Analytics). Footer has Privacy and Cookie settings links. Slides up 16px on open; reduced motion shows it instantly. |
| Sticky glass nav | 64px, `backdrop-filter: blur(18px) saturate(160%)`, hairline bottom border. Desktop (≥ 60rem): Home, About, Tech, Coffee Blog (hover/focus/click dropdown), Music, Photography, Contact. Below 60rem: full-screen sheet with large links (the four brew guides start collapsed under a chevron next to Coffee Blog) (the breakpoint is 60rem, not 48rem, so seven links never crowd the actions). Layout: burger (below 60rem) and logo on the left, then the links; search and theme toggle on the right. |
| Theme switch | A sun/moon pill (`role="switch"`, label "Dark mode", `aria-checked` = dark). Both icons stay visible; an accent thumb slides under the active theme with a spring ease (no slide under reduced motion). 80×44px, 64×44px below 25rem. |
| Search palette | `<dialog>` command palette over a static page index. Opens with the search icon, Ctrl/⌘+K, or "/". Arrow keys + Enter. Opens with a spring (`--ease-spring`, `--dur-spring` 450ms) and staggered results, closes fast with `--ease-exit`; built in CSS (`@starting-style`, `allow-discrete`) so phones get it too, and interruptible. Reduced motion: opacity only. |
| Photo frame (`.frame`) | Squircle clip, 1px inner hairline ring, `object-fit: cover`. |
| Home heading | "Welcome to / John's Portfolio!" in `--fs-display`. An emerald hand-drawn swash sits under "John's Portfolio!". Subtitle: a plain line with emerald dot separators; below 48rem the three items stack one per line and the dots hide. Portrait on top. |
| Home index (button stack) | Five editorial rows on hairline rules, visible on load: large `--fs-index` title, one-line description, 44px arrow. Hover, focus and press wipe an emerald fill across the row (`clip-path`, exit faster than entry) and the text turns `--accent-ink`; hover is mouse-only so a tapped row never stays filled. Every row uses the same arrow glyph; external links (Photography) show it rotated 45° and announce "opens in a new tab". |
| About sections | Left-aligned stacked blocks. Intro paragraph as wide as the 3-photo collage. Education as ledger rows (date, monochrome school logo, school, degree), newest first, hairlines full width. Credentials as compact index rows under "Badge & Profile" and "Certificate". Closing callout without a card. |
| Project card (Tech) | One lead card (keeploop: title, lede, description, mono stack line, GitHub and PyPI buttons, and a four-step "Propose, Score, Keep, Revert" list), then hairline-separated work rows (term label, title, copy, stack line, link buttons). No status pill and no diagram. |
| Brew card (Coffee) | Original line-art illustration on a warm crema glow, title, one-line description. One object card at every width (`--surface`, border) holding the 16:10 art, title, description, a mono "N min read" line (article words / 230) and the arrow; the art sits a small inset from the frame, the text a wider one. Phones: one column (owner pick "B" 2026-11-16, after a Webflow showcase review), 10px inset, art at `--r-md`, card radius `--r-md` + 10px (concentric). From 48rem: two columns, padding `--inset`, art `--r-lg` inside `--r-xl`. Hover (mouse) / focus: border `--border-strong`, `--surface-2`, accent title, arrow fills. |
| Article (Coffee), "Chapters" | `article.brew` (owner decision 2026-11-14). A transparent head (breadcrumb, H1, byline, then the hero photo, eager with `fetchpriority="high"`) so the fixed ambient glow shows, then `section.chapter` blocks that each paint their own surface: `--bg`, `--band`, and one `--band-warm`. No two adjacent chapters share a surface. Chapter padding is `--space-chapter`; titles `--fs-chapter` (max 18ch, centered from 60rem, left-aligned on phones); ledes `--fs-lead` (max 40ch), each one a section's first sentence moved out of its paragraph; body `--fs-article`. Order: head, At a glance (`--band`, line art 5/12 + ledger 7/12 in one object card), What is, profile, steps, tip (warm), FAQ, end (`--band`: references, then prev/next). Widths: media 72rem (hero, photos, glance card, step cards, FAQ, pager); reading text 36rem, 46rem from 60rem (body is 19px there); the chart stays 56rem. |
| Chapter photos | Hero: 16:9 from 60rem, the photo's own ratio below, caption and credit under it. Wide photo: 72rem, 16:9 from 60rem, per-photo `object-position` where a subject is cut. Photo pair: two 4:5 photos side by side at every width, each with its own caption (the step it shows) and credit; `sizes` are `(min-width: 60rem) 35rem, calc(50vw - 1.5rem)` so phones never fetch desktop files. Split: from 60rem 7fr text and 5fr 4:5 photo (`--space-9` gap, photo side can flip); on phones text, then the photo (max 26rem). At most two splits in a row. |
| Step cards, FAQ, references (Chapters) | Step cards from 60rem: one row of `--surface` cards with a mono accent numeral, step name and text; columns follow the step count through `:has()` (5 steps: 5 columns; 6: 3; 4 or 8: 4). Phones keep the numbered timeline. FAQ: 2×2 grid from 48rem (stacked on phones), `--border-strong` hairline on top of each item. References, from 60rem: a centered heading over a full-content-width grid of numbered cards (`auto-fit`, min 18rem); phones keep the numbered list. |
| Pager card | Previous / Next at every width: 64px line-art thumb, mono label, title, arrow circle; 80px tall; stacked on phones, two up from 48rem. |
| Link card | Certificates, badges: meta label + title + arrow. |
| Music card | One object card per mix: cover inset `--inset` (cropped to the inner artwork with `scale: 1.46` on the img), title + optional "Latest" pill, 44px icon link to SoundCloud. Closing row under a hairline: cookie note left, ghost "All tracks on SoundCloud" right (full width on phones). |
| Icon link | 44px circle, 1px `--border-strong` ring, icon `--text-muted`; hover/focus fills `--accent`, icon `--accent-ink`. |
| Contact tiles | Three equal tiles (LinkedIn, GitHub, Instagram): homepage icon, name, mono handle (hidden below 30rem), ↗ in the corner. Hover/focus: icon lifts 3px and scales 1.08 with `--ease-spring` / `--dur-spring`, settles with `--ease-exit` / `--dur-fast`; border tints accent. Press 0.97. Reduced motion: colour and border change only. |
| Callout | End-of-page CTA panel with soft dual glow. |
| Pills | Status only: "Open to Summer 2027 internships" (pulsing green dot). The "In progress" pill left the site with the in-progress project cards (2026-11-13). |

## 6. Motion

Every animation is gated on `prefers-reduced-motion: no-preference`; under `reduce`, all transitions and animations collapse to instant (including `animation-delay: 0s`, so staggers cannot reveal one by one), and GSAP is not loaded at all. Scroll reveals are retired site-wide (owner decision 2026-11-13): content is simply there, and the brew articles have no motion beyond hover feedback.

GSAP 3.15.1 is self-hosted in `site/assets/js/vendor/gsap-3.15.1/` (core, ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin, MorphSVGPlugin; free under the GSAP Standard License). An inline loader in each page's `<head>` fetches only what that page uses, in order, then `site/assets/js/motion.js`: ScrollTrigger and ScrollSmoother on desktop pointers (`hover: hover` and `pointer: fine`) only; SplitText and ScrambleTextPlugin on Home; SplitText on About; MorphSVGPlugin on Contact. A page with no intro loads no GSAP on phones. Pages whose intro starts hidden set `html.motion-intro` in the `<head>`, so the start state exists from first paint, with a 1.5s CSS safety net that shows everything if GSAP never arrives. ScrollSmoother wraps `main` and the footer in `#smooth-wrapper` / `#smooth-content` at runtime; the fixed header, ambient glow, cookie banner, and search dialog stay outside it, so never put `position: fixed` or `sticky` elements inside `main`. Native `element.scrollIntoView()` does not move the smoothed layer: scroll programmatically with `ScrollSmoother.get()?.scrollTo(el, true, "top 80px")` (fall back to native when it returns null). The smoother pauses while the search palette or the mobile menu is open, and focused elements glide into view with about 1 s of smoothing lag.

| Motion | Purpose |
|---|---|
| Home heading (GSAP SplitText, per letter) | Each letter enters from a fixed hand-picked cycle of upright moves (rise, drop, pop, stretch, slide), never rotating or wobbling. The "o" in "Welcome" (circle) and the "o" in "to" (square) start as small emerald shapes and become the letter. Letters land left to right in about 1.3s on desktop and 1s on phones, then one emerald light band sweeps across "John's Portfolio!". Hovering a letter replays its entrance (desktop pointers) |
| Home swash (GSAP, `strokeDashoffset`) | The emerald hand-drawn swash under "John's Portfolio!" draws once, after the letters land: 1.6s, `power1.inOut`, `autoRound: false` (GSAP's default px rounding would make a `pathLength="1"` stroke pop in instead of draw) |
| Home subtitle (GSAP ScrambleText) | Each of the three items decodes left to right in 0.55s. Screen readers keep the real text; the scramble runs in an `aria-hidden` overlay that is removed when it settles |
| Home portrait | Pops in straight from 0.9 to 1 scale; on desktop pointers it tilts toward the pointer by at most 4deg (`quickTo`, 0.5s) and levels on leave |
| Contact heading morph (GSAP MorphSVG) | "Let's talk." is inline SVG glyph outlines (Google Sans, one path per glyph, regenerated with `docs/tools/contact-glyphs.py`). Each glyph starts as a small solid emerald shape (circle, rounded square, pill; dots for the apostrophe and the full stop) and morphs into its letter left to right while the fill eases to the heading color. Once, upright, no shapes at rest, no typing |
| Smooth scrolling (GSAP ScrollSmoother, `smooth: 1.1`) | Inertial, glide-to-stop wheel/trackpad scrolling. Desktop pointers only (`hover: hover` and `pointer: fine`); phones and tablets keep native scrolling. Same-page anchors glide and land under the header; deep links (`/tech/#…`) land under the header too |
| About intro write-on (GSAP, all devices that allow motion) | The one scroll-triggered effect, an exception to "scroll reveals retired" (owner decision 2026-11-13). The intro (as wide as the collage) is revealed as if by pen: a soft-edged mask sweeps each line left to right, one line after another, at ~110 characters/s (~3.9s), once, when 30% is in view. No DOM split (one mask layer per line box), so screen readers and line breaks are untouched. Reduced motion, JS off or no GSAP: static text (About loads GSAP and SplitText on every device that allows motion, about 35 KB, owner-accepted) |
| Search palette open/close (CSS) | Spring open with staggered results (`--ease-spring`, `--dur-spring` 450ms), fast `--ease-exit` close, interruptible; reduced motion: opacity only |
| Portrait halo (slow conic rotation) | Draws the eye to the one hero visual |
| Home index emerald wipe, Contact tile spring, arrow nudge | Feedback that a row or tile is interactive. Home rows wipe `--accent` across on hover, focus and press (mouse-only hover). Contact tiles lift 3px and scale 1.08 with `--ease-spring`; reduced motion: color only |
| Cross-document View Transitions | Smooth page-to-page navigation where supported |
| Pulse on the "Open to internships" dot | Signals live availability (the only perpetual loop besides the halo) |

## 7. Accessibility

Skip link; visible focus ring (`--accent`, 2px, offset 3px); touch targets ≥ 44px; meaningful alt text; external links announce new tabs; `aria-current` on the active nav item; diagrams carry a text `aria-label`; color contrast ≥ 4.5:1 for text in both themes.

## 8. Imagery

Local WebP only (`site/assets/img/`), generated from originals kept outside the repo (`C:\Users\hmn19\Pictures\portfolio-originals\`). Responsive `srcset`/`sizes`, explicit dimensions (no CLS), `fetchpriority="high"` on the hero portrait, lazy-loading elsewhere.
