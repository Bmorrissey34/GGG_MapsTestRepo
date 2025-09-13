// components/legend.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Legend.module.css";

/** Convert label -> safe CSS class (e.g., "Academic Building" => "academic-building") */
function labelToClass(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Normalize color input to a consistent CSS string */
function normalizeColor(c) {
  if (!c) return "";
  const s = String(c).trim();
  // Allow #hex, rgb/rgba(), hsl/hsla(), and CSS color names as-is
  return s;
}

/**
 * Apply legend colors to matching SVG elements.
 * It looks for elements with classes matching the normalized label, within the map scope.
 */
function applyLegendColors(items, scopeEl) {
  if (!Array.isArray(items) || items.length === 0 || !scopeEl) return;

  items.forEach((it) => {
    const cls = labelToClass(it.label);
    const color = normalizeColor(it.color);
    if (!cls || !color) return;

    // Query elements with the class inside the scope
    const nodes = scopeEl.querySelectorAll(`.${cls}`);
    nodes.forEach((el) => {
      // Set fill if the element has a fill or none/absent
      const currentFill = el.getAttribute("fill");
      if (!currentFill || currentFill === "none") {
        el.setAttribute("fill", color);
      } else {
        // Respect an existing explicit fill? Uncomment next line to always override:
        // el.setAttribute("fill", color);
      }

      // If the element is stroke-only (lines/paths), color stroke too
      const currentStroke = el.getAttribute("stroke");
      if (currentStroke || (!currentFill || currentFill === "none")) {
        el.setAttribute("stroke", color);
        if (!el.getAttribute("stroke-width")) {
          el.setAttribute("stroke-width", "1.5");
        }
      }
    });
  });
}

export default function Legend({
  locale = "en",
  /** CSS selector that wraps your rendered SVG. Defaults to a common wrapper you use. */
  mapScopeSelector = ".map-wrap, #map-root, main",
}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const scopeRef = useRef(null);
  const observerRef = useRef(null);

  // Build fetch order: locale first, then English fallback.
  const urls = useMemo(
    () => [
      `/data/legend/legendItems.${locale}.json`,
      `/data/legend/legendItems.en.json`,
    ],
    [locale]
  );

  // Resolve scope element after mount
  useEffect(() => {
    const resolved =
      document.querySelector(mapScopeSelector) ||
      document.querySelector(".map-wrap") ||
      document.querySelector("#map-root") ||
      document;
    scopeRef.current = resolved;
  }, [mapScopeSelector]);

  // Load legend items
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setStatus("loading");
      for (const url of urls) {
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            cache: "force-cache",
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled) {
            setItems(Array.isArray(data) ? data : []);
            setStatus("ready");
          }
          return;
        } catch {
          /* try next URL */
        }
      }
      if (!cancelled) setStatus("error");
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [urls]);

  // Apply colors when items are ready AND whenever the SVG content changes.
  useEffect(() => {
    if (status !== "ready" || !scopeRef.current) return;

    const scopeEl = scopeRef.current;

    // Initial paint
    applyLegendColors(items, scopeEl);

    // Repaint on DOM changes inside the scope (e.g., InlineSvg loads/updates)
    if (observerRef.current) observerRef.current.disconnect();
    const obs = new MutationObserver(() => applyLegendColors(items, scopeEl));
    observerRef.current = obs;
    obs.observe(scopeEl, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["fill", "stroke", "class"],
    });

    return () => obs.disconnect();
  }, [status, items]);

  return (
    <aside
      id="map-legend"
      className={styles.legend}
      aria-label="Map legend"
      role="complementary"
    >
      <div className={styles.header}>
        <h2>Legend</h2>
      </div>

      {status === "loading" && (
        <ul className={styles.list}>
          <li className={styles.item}>
            <span className={styles.swatch} aria-hidden="true" />
            Loading…
          </li>
        </ul>
      )}

      {status === "ready" && (
        <ul className={styles.list}>
          {items.map((it) => {
            const cls = labelToClass(it.label);
            return (
              <li key={it.label} className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ background: normalizeColor(it.color) }}
                  aria-hidden="true"
                  title={`.${cls}`}
                />
                <span>{it.label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {status === "error" && (
        <div className={styles.list} style={{ padding: "10px 12px" }}>
          Couldn’t load legend.
        </div>
      )}
    </aside>
  );
}
