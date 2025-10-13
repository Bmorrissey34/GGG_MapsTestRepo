'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'helpfulLinksOpen';

const LINKS = [
  {
    id: 'tour',
    href: 'https://www.ggc.edu/about-ggc/maps-and-directions',
    label: 'Virtual Tour',
  },
  {
    id: 'homepage',
    href: 'https://www.ggc.edu/',
    label: "GGC's Website",
  },
  {
    id: 'original-map',
    href: 'http://ggcmaps.com/#Campus',
    label: "GGC's Original Map",
  },
];

export default function Links({ className = '' }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === '0') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
  }, [open]);

  const slotClassName = ['legend-slot', className, open ? '' : 'is-collapsed'].filter(Boolean).join(' ');
  const panelClassName = ['legend-panel', 'link-panel', open ? '' : 'legend-panel--collapsed']
    .filter(Boolean)
    .join(' ');
  const toggleLabel = open ? 'Hide helpful links' : 'Show helpful links';

  return (
    <aside className={slotClassName} aria-labelledby="helpful-links-title">
      <div className={panelClassName}>
        <div className="legend-header d-flex align-items-center gap-2">
          <h2 id="helpful-links-title" className="legend-title link-panel-title fw-bold mb-0">
            Helpful Links
          </h2>
          <button
            type="button"
            className="legend-toggle ms-auto"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="helpful-links-body"
            title={toggleLabel}
          >
            <i
              className={`bi ${open ? 'bi-chevron-right' : 'bi-chevron-left'} legend-toggle-icon`}
              aria-hidden="true"
            ></i>
            <span className="visually-hidden">{toggleLabel}</span>
          </button>
        </div>
        <div id="helpful-links-body" className="legend-body link-panel-body" hidden={!open}>
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-panel-button"
            >
              <span className="link-panel-button-secondary">For {link.label}</span>
              <span className="link-panel-button-primary">Click here</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
