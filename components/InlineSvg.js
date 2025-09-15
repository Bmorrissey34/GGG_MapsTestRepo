'use client';
import { useEffect, useRef, useState } from 'react';

// Sanitize the SVG content to remove potentially harmful scripts and attributes
function sanitize(t) {
  return t
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/\son\w+="[^"]*"/gi, '') // Remove inline event handlers (double quotes)
    .replace(/\son\w+='[^']*'/gi, '') // Remove inline event handlers (single quotes)
    .replace(/\s(xlink:)?href=["']\s*javascript:[^"']*["']/gi, ' '); // Remove JavaScript hrefs
}

// Infer the type of an SVG element based on its class
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
  src, // Path to the SVG file
  className = '', // Additional CSS classes for styling
  interactiveSelector = '.building-group, .building, .room-group', // Selector for interactive elements
  selectedId = null, // ID of the currently selected element
  onSelect, // Callback for when an element is selected
  onReady, // Callback for when the SVG is ready
}) {
  const ref = useRef(null);
  const [markup, setMarkup] = useState(null); // State to store the sanitized SVG markup
  const [error, setError] = useState(null); // State to store any loading errors
  const prev = useRef(null); // Reference to the previously selected element

  // Fetch and sanitize the SVG content when the source changes
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

  // Add interactivity and accessibility to the SVG elements
  useEffect(() => {
    if (!markup || !ref.current) return;
    const root = ref.current;

    // Handle click events on interactive elements
    const click = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (el) {
        const normalizedId = el.id ? el.id.toLowerCase() : null; // Normalize the ID to lowercase
        onSelect?.(normalizedId, el);
      }
    };

    // Handle keyboard events for accessibility
    const key = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (!el) return;
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        onSelect?.(el.id || null, el); 
      }
    };

    // Enhance accessibility by adding attributes to interactive elements
    root.querySelectorAll(interactiveSelector).forEach(el => {
      el.hasAttribute('tabindex') || el.setAttribute('tabindex', '0'); // Make elements focusable
      el.hasAttribute('role') || el.setAttribute('role', 'button'); // Add a button role
      if (!el.hasAttribute('aria-label')) {
        const t = el.querySelector('text');
        el.setAttribute('aria-label', (t && t.textContent.trim()) || el.id || 'map element');
      }
    });

    root.addEventListener('click', click);
    root.addEventListener('keydown', key);

    // Report the IDs of interactive elements to the parent component
    if (onReady) {
      const items = Array.from(root.querySelectorAll(interactiveSelector))
        .filter(el => el.id && String(el.id).trim().length > 0)
        .map(el => {
          const label = el.querySelector('text')?.textContent?.trim() || '';
          return {
            id: el.id, // Element ID
            kind: inferKind(el), // Inferred type of the element
            name: label, // Label text (if available)
            svg: src, // Source of the SVG
          };
        });
      onReady(items);
    }

    return () => {
      root.removeEventListener('click', click);
      root.removeEventListener('keydown', key);
    };
  }, [markup, interactiveSelector, onSelect, onReady, src]);

  // Highlight the selected element and remove highlighting from the previous one
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prev.current) {
      const p = root.querySelector(`#${CSS.escape(prev.current)}`);
      if (p) { 
        p.classList.remove('active-room'); 
        p.setAttribute('aria-selected','false'); 
      }
    }
    if (selectedId) {
      const el = root.querySelector(`#${CSS.escape(selectedId)}`);
      if (el) { 
        el.classList.add('active-room'); 
        el.setAttribute('aria-selected','true'); 
      }
      prev.current = selectedId;
    } else {
      prev.current = null;
    }
  }, [selectedId]);

  // Error handling: log the error and display a fallback UI
  if (error) {
    console.error('Error loading SVG:', error);
    return <div className="svg-error">Error loading SVG: {error}</div>;
  }

  return (
    <div
      ref={ref}
      className={`inline-svg ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
      style={{ isolation: 'isolate' }} // Contain the shadow DOM
    />
  );
}
