'use client';
import { useEffect, useRef, useState } from 'react';

function sanitize(t) {
  return t
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\s(xlink:)?href=["']\s*javascript:[^"']*["']/gi, ' ');
}

function inferKind(el) {
  const cls = (el.className && el.className.baseVal) || el.getAttribute('class') || '';
  const c = cls.toLowerCase();
  if (c.includes('room')) return 'room';
  if (c.includes('building')) return 'building';
  if (c.includes('parking')) return 'parking';
  if (c.includes('poi') || c.includes('store') || c.includes('dining')) return 'poi';
  return 'poi';
}

export default function InlineSvg({
  src,
  className = '',
  interactiveSelector = '.building-group, .building, .room-group',
  selectedId = null,
  onSelect,
  onReady, // <- new
}) {
  const ref = useRef(null);
  const [markup, setMarkup] = useState(null);
  const [error, setError] = useState(null);
  const prev = useRef(null);

  useEffect(() => {
    let alive = true;
    setMarkup(null);
    setError(null);
    fetch(src, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(t => { if (alive) setMarkup(sanitize(t)); })
      .catch(err => { if (alive) setError(err.message); });
    return () => { alive = false; };
  }, [src]);

  useEffect(() => {
    if (!markup || !ref.current) return;
    const root = ref.current;

    const click = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (el) onSelect?.(el.id || null, el);
    };
    const key = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (!el) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(el.id || null, el); }
    };

    // a11y + focusability
    root.querySelectorAll(interactiveSelector).forEach(el => {
      el.hasAttribute('tabindex') || el.setAttribute('tabindex', '0');
      el.hasAttribute('role') || el.setAttribute('role', 'button');
      if (!el.hasAttribute('aria-label')) {
        const t = el.querySelector('text');
        el.setAttribute('aria-label', (t && t.textContent.trim()) || el.id || 'map element');
      }
    });

    root.addEventListener('click', click);
    root.addEventListener('keydown', key);

    // REPORT REAL IDS to the parent
    if (onReady) {
      const items = Array.from(root.querySelectorAll(interactiveSelector))
        .filter(el => el.id && String(el.id).trim().length > 0)
        .map(el => {
          const label = el.querySelector('text')?.textContent?.trim() || '';
          return {
            id: el.id,
            kind: inferKind(el),
            name: label,        // may be '', that’s fine
            svg: src,
          };
        });
      onReady(items);
    }

    return () => {
      root.removeEventListener('click', click);
      root.removeEventListener('keydown', key);
    };
  }, [markup, interactiveSelector, onSelect, onReady, src]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prev.current) {
      const p = root.querySelector(`#${CSS.escape(prev.current)}`);
      if (p) { p.classList.remove('active-room'); p.setAttribute('aria-selected','false'); }
    }
    if (selectedId) {
      const el = root.querySelector(`#${CSS.escape(selectedId)}`);
      if (el) { el.classList.add('active-room'); el.setAttribute('aria-selected','true'); }
      prev.current = selectedId;
    } else {
      prev.current = null;
    }
  }, [selectedId]);

  if (error) {
    return <div className="alert alert-warning m-2">Couldn’t load <code>{src}</code> ({error}). Check path/casing under <code>/public</code>.</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      aria-busy={markup ? 'false' : 'true'}
    />
  );
}
