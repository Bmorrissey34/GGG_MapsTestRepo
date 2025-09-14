// components/legend.jsx
"use client";

import React from "react";
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
  return (
    <div className={styles.legendContainer}>
      <aside className={styles.legend} role="region" aria-label="Map legend">
        <div className={styles.legendHeader}>
          <span className={styles.legendDot} />
          <h4 className={styles.legendTitle}>Legend</h4>
        </div>

        <ul className={styles.list}>
          <SwatchItem color="#0f5132" label="Academic Building" />
          <SwatchItem color="#6b21a8" label="Student Housing" />

          {/* Section heading (no swatch) but aligned with rows that have one */}
          <li className={styles.sectionHeading}>Parking</li>
          <ul className={styles.sublist}>
            <li className={styles.subitem}>
              <span className={styles.swatch} style={{ background: "#f59e0b" }} />
              <span>Reserved</span>
            </li>
            <li className={styles.subitem}>
              <span className={styles.swatch} style={{ background: "#eab308" }} />
              <span>Residents</span>
            </li>
            <li className={styles.subitem}>
              <span className={styles.swatch} style={{ background: "#86efac" }} />
              <span>Students</span>
            </li>
            <li className={styles.subitem}>
              <span className={styles.swatch} style={{ background: "#93c5fd" }} />
              <span>Handicap</span>
            </li>
          </ul>

          <SwatchItem
            color="#9ca3af"
            label="Restricted Area"
            className={styles.sectionLabel}
          />
        </ul>
      </aside>
    </div>
  );
}
