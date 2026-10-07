// Espresso brewing control chart (Plotly, lazy-loaded). Theme-aware; data mirrored in the table view.
(() => {
  const el = document.getElementById("tds-chart");
  if (!el) return;

  const PLOTLY_SRC = "/assets/vendor/plotly-basic-2.35.2.min.js";
  const RATIOS = [1.5, 2, 2.5, 3]; // beverage weight ÷ dose
  const EY_MIN = 14, EY_MAX = 26, TDS_MIN = 4, TDS_MAX = 17;

  // Ordinal green ramps, validated with the dataviz palette checker against each theme's surface.
  // Strongest ratio gets the most contrast in both themes.
  const THEMES = {
    dark: {
      surface: "#121215", text: "#f4f4f5", muted: "#a8a8b1", faint: "#8a8a93",
      grid: "rgba(255,255,255,0.08)", accent: "#34d399", zone: "rgba(52,211,153,0.10)",
      ramp: ["#d1fae5", "#6ee7b7", "#34d399", "#059669"],
    },
    light: {
      surface: "#ffffff", text: "#111113", muted: "#4f4f57", faint: "#66666e",
      grid: "rgba(0,0,0,0.08)", accent: "#047857", zone: "rgba(4,120,87,0.08)",
      ramp: ["#064e3b", "#047857", "#059669", "#10b981"],
    },
  };

  const range = (a, b, step) => Array.from({ length: Math.round((b - a) / step) + 1 }, (_, i) => +(a + i * step).toFixed(2));

  function build() {
    const t = THEMES[document.documentElement.dataset.theme === "light" ? "light" : "dark"];
    const narrow = el.clientWidth < 520;

    const lines = RATIOS.map((r, i) => {
      const x = range(EY_MIN, Math.min(EY_MAX, TDS_MAX * r), 0.25);
      return {
        type: "scatter", mode: "lines", name: `1:${r}`,
        x, y: x.map((ey) => +(ey / r).toFixed(2)),
        line: { color: t.ramp[i], width: 2, shape: "linear" },
        hovertemplate: `1:${r}  <b>%{y:.1f}% TDS</b><extra></extra>`,
      };
    });

    const example = {
      type: "scatter", mode: "markers", name: "Example shot",
      x: [20], y: [10],
      marker: { size: 11, color: t.text, line: { color: t.surface, width: 2 } },
      hovertemplate: "Example: 18 g in, 36 g out<br><b>10% TDS → 20% extraction</b><extra></extra>",
    };

    // Direct labels at each line's end (legend stays as the primary identity channel).
    const lineLabels = RATIOS.map((r) => {
      const xEnd = Math.min(EY_MAX, TDS_MAX * r);
      return { x: xEnd, y: xEnd / r, text: `1:${r}`, xanchor: "left", yanchor: "middle", xshift: 6, showarrow: false, font: { color: t.muted, size: 11 } };
    });

    const zoneLabels = [
      { x: 18.15, y: 11.85, text: "Target", xanchor: "left", yanchor: "top", showarrow: false, font: { color: t.text, size: 12 } },
      { x: EY_MIN + 0.2, y: TDS_MAX - 0.3, text: narrow ? "Under-extracted<br>(sour)" : "Under-extracted (sour)", xanchor: "left", yanchor: "top", align: "left", showarrow: false, font: { color: t.faint, size: 11 } },
      { x: EY_MAX - 0.2, y: TDS_MIN + 0.3, text: narrow ? "Over-extracted<br>(bitter)" : "Over-extracted (bitter)", xanchor: "right", yanchor: "bottom", align: "right", showarrow: false, font: { color: t.faint, size: 11 } },
    ];

    const axis = (title, r) => ({
      title: { text: title, font: { color: t.muted, size: 12 }, standoff: 10 },
      range: r, tickfont: { color: t.faint, size: 11 }, ticksuffix: "%",
      gridcolor: t.grid, gridwidth: 1, zeroline: false, showline: false, fixedrange: true, dtick: 2,
      showspikes: false,
    });

    const layout = {
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "Inter, system-ui, sans-serif", color: t.muted, size: 12 },
      margin: { l: 52, r: 44, t: narrow ? 64 : 40, b: 48 },
      xaxis: { ...axis("Extraction yield", [EY_MIN, EY_MAX]), showspikes: true, spikemode: "across", spikesnap: "cursor", spikethickness: -1, spikedash: "solid", spikecolor: t.faint },
      yaxis: { ...axis("TDS (strength)", [TDS_MIN, TDS_MAX]), tickvals: [6, 8, 10, 12, 14, 16] },
      shapes: [{ type: "rect", x0: 18, x1: 22, y0: 8, y1: 12, fillcolor: t.zone, line: { color: t.accent, width: 1 }, layer: "below" }],
      annotations: [...lineLabels, ...zoneLabels],
      showlegend: true,
      legend: { orientation: "h", x: 0, y: 1.02, yanchor: "bottom", entrywidth: narrow ? 62 : 0, entrywidthmode: "pixels", font: { color: t.muted, size: narrow ? 11 : 12 }, bgcolor: "rgba(0,0,0,0)" },
      hovermode: "x unified",
      hoverlabel: { bgcolor: t.surface, bordercolor: t.grid, font: { family: "Inter, system-ui, sans-serif", color: t.text, size: 12 } },
      height: narrow ? 380 : 460,
    };

    return { data: [...lines, example], layout, config: { displayModeBar: false, responsive: true } };
  }

  let rendered = false;
  const render = () => {
    const { data, layout, config } = build();
    window.Plotly[rendered ? "react" : "newPlot"](el, data, layout, config);
    rendered = true;
  };

  const load = () => {
    if (window.Plotly) return render();
    const s = document.createElement("script");
    s.src = PLOTLY_SRC;
    s.onload = render;
    document.head.appendChild(s);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: "400px 0px" });
    io.observe(el);
  } else {
    load();
  }

  // Re-theme when the Light / Dark / System menu changes the resolved theme.
  new MutationObserver(() => rendered && render()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  let w = el.clientWidth;
  addEventListener("resize", () => {
    if (rendered && (el.clientWidth < 520) !== (w < 520)) render();
    w = el.clientWidth;
  });
})();
