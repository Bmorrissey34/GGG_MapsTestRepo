// components/legend.jsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "./Legend.module.css";

/** Reusable row with color square + label */
function SwatchItem({ color, label, className = "" }) {
  return (
    <li className={`${styles.item} ${className}`}>
      <span className={styles.swatch} style={{ background: color }} />
      <span>{label}</span>
    </li>
  );
}

export default function Legend() {
  const [open, setOpen] = useState(true);

  // remember user preference between page loads (optional)
  useEffect(() => {
    const saved = localStorage.getItem("legendOpen");
    if (saved !== null) setOpen(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("legendOpen", open ? "1" : "0");
  }, [open]);

  return (
    <div className={styles.legendContainer}>
      <aside className={styles.legend} role="region" aria-label="Map legend">
        {/* Header with title + toggle button (upper-right) */}
        <div className={styles.legendHeader}>
          <div className={styles.legendTitle}>Legend</div>

          <button
            type="button"
            className={styles.legendToggle}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="legend-body"
            title={open ? "Hide legend" : "Show legend"}
          >
            {open ? "▾" : "▸"}
          </button>
        </div>

        {/* Collapsible body */}
        <div id="legend-body" hidden={!open} className={styles.legendBody}>
          <ul className={styles.list}>
            <SwatchItem color="#0f5132" label="Academic Building" />
            <SwatchItem color="#6b21a8" label="Student Housing" />

            {/* Section: Parking */}
            <li className={styles.sectionHeading}>
              <span>Parking</span>
              <ul className={styles.sublist}>
                <li className={styles.subitem}>
                  <span
                    className={styles.swatch}
                    style={{ background: "#e874be" }}
                  />
                  <span>Faculty/Staff</span>
                </li>
                <li className={styles.subitem}>
                  <span
                    className={styles.swatch}
                    style={{ background: "#e8bf74" }}
                  />
                  <span>Residents</span>
                </li>
                <li className={styles.subitem}>
                  <span
                    className={styles.swatch}
                    style={{ background: "#86efac" }}
                  />
                  <span>Students</span>
                </li>
                <li className={styles.subitem}>
                  <span
                    className={styles.swatch}
                    style={{ background: "#93c5fd" }}
                  />
                  <span>Handicap</span>
                </li>
              </ul>
            </li>

            <SwatchItem
              color="#9ca3af"
              label="Restricted Area"
              className={styles.sectionLabel}
            />
          </ul>
        </div>
      </aside>
    </div>
  );
}
