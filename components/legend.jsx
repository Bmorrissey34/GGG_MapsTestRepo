"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./Legend.module.css";

/**
 * Turn a label into a safe CSS class:
 * "Academic Building" -> "academic-building"
 * "Restricted Area!"   -> "restricted-area"
 */
function labelToClass(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // drop punctuation
    .replace(/\s+/g, "-");         // spaces -> hyphens
}

/**
 * Apply legend colors to matching SVG elements.
 * It looks for elements with classes matching the normalized label.
 * e.g., label "Academic Building" -> selects ".academic-building"
 */
function applyLegendColors(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  // Try to scope to a known map container if you have one (e.g., "#map-root" or ".map-wrap").
  // We’ll search within the whole document as a fallback.
  const scope = document.querySelector(".map-wrap") || document;

  items.forEach((it) => {
    const cls = labelToClass(it.label);
    if (!cls || !it.color) return;

    // Select matching nodes and paint them.
    const nodes = scope.querySelectorAll(`.${cls}`);
    if (nodes.length === 0) {
      // Helpful during setup—comment out later if noisy.
      // console.warn(`[Legend] No elements found for class ".${cls}"`);
      return;
    }

    nodes.forEach((el) => {
      // Prefer fill. If your SVG uses stroke-only shapes, you can also set stroke.
      el.setAttribute("fill", it.color);
      // Optional fallback for line-art:
      // if (!el.getAttribute("fill") || el.getAttribute("fill") === "none") {
      //   el.setAttribute("stroke", it.color);
      // }
    });
  });
}

export default function Legend({ locale = "en" }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // Build fetch order: locale first, then English fallback.
  const urls = useMemo(
    () => [
      `/data/legend/legendItems.${locale}.json`,
      `/data/legend/legendItems.en.json`,
    ],
    [locale]
  );

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
            const normalized = Array.isArray(data) ? data : [];
            setItems(normalized);
            setStatus("ready");
          }
          return;
        } catch {
          // try next URL
        }
      }
      if (!cancelled) setStatus("error");
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [urls]);

  // When items are ready, color the SVG
  useEffect(() => {
    if (status !== "ready") return;
    applyLegendColors(items);
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
        {/* No close button – legend is permanent */}
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
                  style={{ background: it.color }}
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
