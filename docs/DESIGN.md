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
| `--crema` | `#e9a35b` | `#a3561a` | Coffee art glow and "In progress" status dot only |
| `--success` | `#4ade80` | `#15803d` | "Open to internships" live dot only |

Ambient background: two very soft radial glows (accent and crema) plus a 3-5% film-grain layer. No blue anywhere (owner decision 2026-10-07) on a fixed, `pointer-events: none` element.

## 3. Typography

- **Inter** variable (100-900, optical sizing on), self-hosted WOFF2 with latin, latin-ext, and Vietnamese subsets. Identical rendering on every device; no reliance on system fonts.
- **JetBrains Mono** variable for small technical labels (chips, dates, diagram notes).

| Token | Size | Use |
|---|---|---|
| `--fs-display` | clamp(2.75rem → 6.25rem) | Home hero, Contact hero |
| `--fs-3xl` | clamp(2.25rem → 4rem) | Page H1 |
| `--fs-2xl` | clamp(1.75rem → 2.75rem) | Section titles, project titles |
| `--fs-xl` | clamp(1.375rem → 1.75rem) | Card titles |
| `--fs-lg` / `--fs-base` / `--fs-sm` / `--fs-xs` | 1.25 / 1.0625 / 0.875 / 0.75rem | Lede / body / UI / labels |

Display tracking `-0.035em`, display line-height `1.04`, body line-height `1.65`. Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## 4. Space, layout, radii

- Space scale (4px base): `--space-1` 4px through `--space-10` 128px. Gutter: clamp(16px → 32px). Content width 72rem; prose width 42rem.
- Breakpoints (mobile-first): 40rem (640px), 48rem (768px), 60rem (960px).
- Radii: `--r-xs` 8, `--r-sm` 12, `--r-md` 18, `--r-lg` 26, `--r-xl` 36 (px), `--r-pill` 999px.
- **Squircles:** elements with class `.sq` get `corner-shape: squircle` where supported (Chromium 139+), and every radius token is multiplied by `--sq: 1.65` so the smoother curve keeps the same visual roundness. Other browsers keep normal rounded corners.
- Radius rule: buttons, pills, and icon buttons are full pill; cards and photo frames use `--r-lg`/`--r-xl`; inner elements use smaller radii (nested radius = outer minus padding).

## 5. Components

| Component | Notes |
|---|---|
| Logo mark | Avatar line art as a CSS mask in a 40px circle. On hover or keyboard focus it inverts with a 320 ms ease (circle fills with `--text`, drawing turns `--bg`) while a 1.5px accent ring draws itself clockwise (animated `@property --ring`); on press it scales to 0.92 for tactile feedback. Reduced motion makes both instant. |
| Back to top | Pill button in every footer, links to `#top`; smooth scroll only when motion is allowed. |
| Article extras | Byline with author link and `Updated` date; an "At a glance" summary box (accent-tinted) at the top for quick answers; question-style H2s; an FAQ section of H3 questions; internal links to sibling guides. |
| Article figure | In-body photo in a squircle frame, caption plus a credit line (title, author, license, Wikimedia Commons). Landscape figures span the prose width; portrait ones cap at 26rem and center. |
| Chart figure | Elevated card: title, one-line subtitle, Plotly chart (lazy-loaded), "Show the data as a table" disclosure, and a source line. Ordinal green ramps validated against each theme's surface: dark `#d1fae5 #6ee7b7 #34d399 #059669`, light `#064e3b #047857 #059669 #10b981`; hairline solid crosshair; text never wears the series color. |
| Cookie consent | Glass card fixed bottom-left on desktop (30rem) and full width on mobile; cookie icon, title, short copy, privacy link; Accept all and Reject all share the same filled style (equal prominence), Customize is a text link that reveals switches (Strictly necessary locked on, Analytics). Footer has Privacy and Cookie settings links. Slides up 16px on open; reduced motion shows it instantly. |
| Sticky glass nav | 64px, `backdrop-filter: blur(18px) saturate(160%)`, hairline bottom border. Desktop (≥ 60rem): Home, About, Tech, Coffee Blog (hover/focus/click dropdown), Music, Photography, Contact. Below 60rem: full-screen sheet with large links (the four brew guides start collapsed under a chevron next to Coffee Blog) (the breakpoint is 60rem, not 48rem, so seven links never crowd the actions). Layout: burger (below 60rem) and logo on the left, then the links; search and theme toggle on the right. |
| Theme switch | A sun/moon pill (`role="switch"`, label "Dark mode", `aria-checked` = dark). Both icons stay visible; an accent thumb slides under the active theme with a spring ease (no slide under reduced motion). 80×44px, 64×44px below 25rem. |
| Search palette | `<dialog>` command palette over a static page index. Opens with the search icon, Ctrl/⌘+K, or "/". Arrow keys + Enter. |
| Photo frame (`.frame`) | Squircle clip, 1px inner hairline ring, `object-fit: cover`. |
| Home button stack | Five wide rows (title + one-line description + arrow chip); green cursor-following spotlight on hover, arrow chip fills green and the arrow nudges forward. Every row uses the same arrow glyph; external links (Photography) show it rotated 45° and announce "opens in a new tab". |
| Project card (Tech) | Bento feature row: status pill, title, description, mono tech chips, and a pipeline diagram drawn from the brief's real architecture (not a fake screenshot). |
| Brew card (Coffee) | Original line-art illustration on a warm crema glow, title, one-line description. |
| Article (Coffee) | Breadcrumb, H1, hero art, prose, "My Usual Profile" stat tiles, numbered step timeline, tip box, references, prev/next pager. |
| Link card | Certificates, badges, pager: meta label + title + arrow. |
| Callout | End-of-page CTA panel with soft dual glow. |
| Pills | Status only: "In progress" (crema dot), "Open to Summer 2027 internships" (pulsing green dot). |

## 6. Motion

Every animation is gated on `prefers-reduced-motion: no-preference`; under `reduce`, all transitions and animations collapse to instant.

| Motion | Purpose |
|---|---|
| Hero rise-in (blur + translate, staggered) | Establishes reading order on first load |
| Scroll reveal (IntersectionObserver, 70ms stagger) | Paces long pages; content is visible without JS |
| Portrait halo (slow conic rotation) | Draws the eye to the one hero visual |
| Hover lift / arrow nudge / spotlight | Feedback that a row or card is interactive |
| Cross-document View Transitions | Smooth page-to-page navigation where supported |
| Pulse on the "Open to internships" dot | Signals live availability (the only perpetual loop besides the halo) |

## 7. Accessibility

Skip link; visible focus ring (`--accent`, 2px, offset 3px); touch targets ≥ 44px; meaningful alt text; external links announce new tabs; `aria-current` on the active nav item; diagrams carry a text `aria-label`; color contrast ≥ 4.5:1 for text in both themes.

## 8. Imagery

Local WebP only (`site/assets/img/`), generated from originals kept outside the repo (`C:\Users\hmn19\Pictures\portfolio-originals\`). Responsive `srcset`/`sizes`, explicit dimensions (no CLS), `fetchpriority="high"` on the hero portrait, lazy-loading elsewhere.
