"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Legend.module.css";

/** "Academic Building" -> "academic-building" */
function labelToClass(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
function normalizeColor(c) {
  if (!c) return "";
  return String(c).trim();
}

/** Recursively flatten items + children for coloring */
function flattenItems(items) {
  const out = [];
  (items || []).forEach((it) => {
    out.push(it);
    if (Array.isArray(it.children)) out.push(...flattenItems(it.children));
  });
  return out;
}

function applyLegendColors(items, scopeEl) {
  if (!Array.isArray(items) || items.length === 0 || !scopeEl) return;

  // flatten parent + children (e.g., Parking subtypes)
  const flat = [];
  (items || []).forEach((it) => {
    flat.push(it);
    if (Array.isArray(it.children)) flat.push(...it.children);
  });

  flat.forEach((it) => {
    const cls = labelToClass(it.label);
    const color = normalizeColor(it.color);
    if (!cls || !color) return;

    const selector = it.selector || `.${cls}`;
    const nodes = scopeEl.querySelectorAll(selector);

    if (nodes.length === 0) {
      console.warn(`[Legend] No SVG matches for "${it.label}" using selector: ${selector}`);
    }

    nodes.forEach((el) => {
      el.style.setProperty("fill", color, "important");
      el.style.setProperty("stroke", color, "important");
      if (!el.getAttribute("stroke-width")) {
        el.setAttribute("stroke-width", "1.5");
      }
    });
  });
}

export default function Legend({
  locale = "en",
  mapScopeSelector = ".map-wrap, #map-root, main",
}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const scopeRef = useRef(null);
  const observerRef = useRef(null);

  const urls = useMemo(
    () => [
      `/data/legend/legendItems.${locale}.json`,
      `/data/legend/legendItems.en.json`,
    ],
    [locale]
  );

  // Resolve SVG scope
  useEffect(() => {
    const resolved =
      document.querySelector(mapScopeSelector) ||
      document.querySelector(".map-wrap") ||
      document.querySelector("#map-root") ||
      document;
    scopeRef.current = resolved;
  }, [mapScopeSelector]);

  // Load legend data
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setStatus("loading");
      for (const url of urls) {
        try {
          const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
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

  // Paint colors and re-paint on mutations
  useEffect(() => {
    if (status !== "ready" || !scopeRef.current) return;
    const scopeEl = scopeRef.current;

    applyLegendColors(items, scopeEl);

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

  /** Reusable row renderer */
  const Row = ({ it }) => {
    const norm = labelToClass(it.label);
    const swatchClass = [styles.swatch, styles[norm]].filter(Boolean).join(" ");
    return (
      <li className={styles.item}>
        <span
          className={swatchClass}
          style={{ background: normalizeColor(it.color) }}
          aria-hidden="true"
          title={`.${norm}`}
        />
        <span>{it.label}</span>
      </li>
    );
  };

  return (
    <aside id="map-legend" className={styles.legend} aria-label="Map legend" role="complementary">
      <div className={styles.header}><h2>Legend</h2></div>

      {status === "loading" && (
        <ul className={styles.list}>
          <li className={styles.item}><span className={styles.swatch} />Loading…</li>
        </ul>
      )}

      {status === "ready" && (
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.label} className={styles.group}>
              <Row it={it} />
              {Array.isArray(it.children) && it.children.length > 0 && (
                <ul className={styles.sublist}>
                  {it.children.map((child) => (
                    <Row key={child.label} it={child} />
                  ))}
                </ul>
              )}
            </li>
          ))}
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
