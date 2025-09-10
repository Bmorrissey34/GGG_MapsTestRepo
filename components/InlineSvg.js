'use client';
import { useEffect, useRef, useState } from 'react';

// very small sanitizer: strips inline JS handlers + <script> tags
function sanitize(svgText) {
  // remove <script>...</script>
  svgText = svgText.replace(/<script[\s\S]*?<\/script>/gi, '');
  // remove inline on* handlers: onclick, onmouseover, etc.
  svgText = svgText.replace(/\son\w+="[^"]*"/gi, '');
  svgText = svgText.replace(/\son\w+='[^']*'/gi, '');
  // disallow javascript: hrefs just in case
  svgText = svgText.replace(/\s(xlink:)?href=["']\s*javascript:[^"']*["']/gi, ' ');
  return svgText;
}

export default function InlineSvg({
  src,
  className = '',
  interactiveSelector = '.room-group', // tailored to your SVG
  selectedId = null,
  onSelect,
}) {
  const wrapRef = useRef(null);
  const [markup, setMarkup] = useState(null);
  const prevSelected = useRef(null);

  useEffect(() => {
    let active = true;
    setMarkup(null);
    fetch(src)
      .then(r => r.text())
      .then(t => {
        if (!active) return;
        setMarkup(sanitize(t));
      })
      .catch(err => console.error('SVG load error:', err));
    return () => { active = false; };
  }, [src]);

  // wire interactivity + a11y once it’s in the DOM
  useEffect(() => {
    if (!markup || !wrapRef.current) return;
    const root = wrapRef.current;

    const handleClick = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (!el) return;
      onSelect?.(el.id || null, el);
    };
    const handleKey = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (!el) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(el.id || null, el);
      }
    };

    // make interactive shapes tabbable/labelled
    root.querySelectorAll(interactiveSelector).forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');

      // if there’s a text label inside, use it for aria-label
      if (!el.hasAttribute('aria-label')) {
        const t = el.querySelector('text');
        if (t && t.textContent.trim()) {
          el.setAttribute('aria-label', t.textContent.trim());
        } else if (el.id) {
          el.setAttribute('aria-label', el.id);
        }
      }
    });

    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKey);
    return () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('keydown', handleKey);
    };
  }, [markup, interactiveSelector, onSelect]);

  // keep selection in sync with your existing CSS (.active-room) + aria
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    if (prevSelected.current) {
      const prev = root.querySelector(`#${CSS.escape(prevSelected.current)}`);
      if (prev) {
        prev.classList.remove('active-room');
        prev.setAttribute('aria-selected', 'false');
      }
    }

    if (selectedId) {
      const el = root.querySelector(`#${CSS.escape(selectedId)}`);
      if (el) {
        el.classList.add('active-room');        // your legacy highlight class
        el.setAttribute('aria-selected', 'true'); // a11y hook
        prevSelected.current = selectedId;
      } else {
        prevSelected.current = null;
      }
    } else {
      prevSelected.current = null;
    }
  }, [selectedId]);

  return (
    <div
      ref={wrapRef}
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={ markup ? { __html: markup } : undefined }
      aria-busy={markup ? 'false' : 'true'}
    />
  );
}
