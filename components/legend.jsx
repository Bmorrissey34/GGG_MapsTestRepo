"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./Legend.module.css";

export default function Legend({ locale = "en" }) {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // Compute URL once per locale
  const urls = useMemo(() => ([
    `/data/legend/legendItems.${locale}.json`, // preferred
    `/data/legend/legendItems.en.json`         // fallback
  ]), [locale]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      for (const url of urls) {
        try {
          const res = await fetch(url, { signal: controller.signal, cache: "force-cache" });
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled) {
            setItems(Array.isArray(data) ? data : []);
            setStatus("ready");
          }
          return;
        } catch {
          // try next URL
        }
      }
      if (!cancelled) setStatus("error");
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, [urls]);

  return (
    <>
      {/* Mobile FAB toggle */}
      <button
        className={styles.fab}
        aria-expanded={open}
        aria-controls="map-legend"
        onClick={() => setOpen(!open)}
        title={open ? "Hide legend" : "Show legend"}
      >
        ℹ️
      </button>

      <aside
        id="map-legend"
        className={`${styles.legend} ${open ? styles.show : styles.hide}`}
        aria-label="Map legend"
        role="complementary"
      >
        <div className={styles.header}>
          <h2>Legend</h2>
          <button
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label="Hide legend"
            title="Hide legend"
          >
            ×
          </button>
        </div>

        {status === "loading" && (
          <ul className={styles.list}>
            <li className={styles.item}><span className={styles.swatch} /> Loading…</li>
          </ul>
        )}

        {status === "ready" && (
          <ul className={styles.list}>
            {items.map((it) => (
              <li key={it.label} className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ background: it.color }}
                  aria-hidden="true"
                />
                <span>{it.label}</span>
              </li>
            ))}
          </ul>
        )}

        {status === "error" && (
          <div className={styles.list} style={{ padding: "10px 12px" }}>
            Couldn’t load legend.
          </div>
        )}

        <button
          className={styles.more}
          onClick={() => alert("Open full legend")}
        >
          More details
        </button>
      </aside>
    </>
  );
}
