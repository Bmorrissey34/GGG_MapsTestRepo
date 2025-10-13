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

// InlineSvg component renders an SVG file and adds interactivity
export default function InlineSvg({
  src, // Path to the SVG file
  className = '', // Additional CSS classes for styling
  interactiveSelector = '.building-group, .building, .room-group', // Selector for interactive elements
  selectedId = null, // ID of the currently selected element
  onSelect, // Callback for when an element is selected
  onReady, // Callback for when the SVG is ready
}) {
  const ref = useRef(null); // Reference to the SVG container
  const [markup, setMarkup] = useState(null); // State to store the sanitized SVG markup
  const [error, setError] = useState(null); // State to store any loading errors
  const prev = useRef(null); // Reference to the previously selected element
  const hoverRefs = useRef(new Map()); // Track hover highlight nodes by source


  // Fetch and sanitize the SVG content when the source changes
  useEffect(() => {
    let alive = true; // Flag to track component lifecycle
    setMarkup(null); // Reset markup state
    setError(null); // Reset error state
    fetch(src, { cache: 'no-store' }) // Fetch the SVG file
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }) // Check response status
      .then(t => { if (alive) setMarkup(sanitize(t)); }) // Set sanitized markup
      .catch(err => { if (alive) setError(err.message); }); // Handle errors
    return () => { alive = false; }; // Cleanup function
  }, [src]);

  // Add interactivity and accessibility to the SVG elements
  useEffect(() => {
    if (!markup || !ref.current) return; // Ensure markup and ref are available
    const root = ref.current; // Reference to the SVG root element

    // Handle click events on interactive elements
    const click = (e) => {
      const el = e.target.closest(interactiveSelector); // Find closest interactive element
      if (el) {
        const normalizedId = el.id ? el.id.toLowerCase() : null; // Normalize the ID to lowercase
        onSelect?.(normalizedId, el); // Call onSelect callback
      }
    };

    // Handle keyboard events for accessibility
    const key = (e) => {
      const el = e.target.closest(interactiveSelector); // Find closest interactive element
      if (!el) return; // Exit if no element found
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); // Prevent default action
        onSelect?.(el.id || null, el); // Call onSelect callback
      }
    };

    // Enhance accessibility by adding attributes to interactive elements
    root.querySelectorAll(interactiveSelector).forEach(el => {
      el.hasAttribute('tabindex') || el.setAttribute('tabindex', '0'); // Make elements focusable
      el.hasAttribute('role') || el.setAttribute('role', 'button'); // Add a button role
      if (!el.hasAttribute('aria-label')) {
        const t = el.querySelector('text'); // Get text content for aria-label
        el.setAttribute('aria-label', (t && t.textContent.trim()) || el.id || 'map element'); // Set aria-label
      }
    });

    root.addEventListener('click', click); // Add click event listener
    root.addEventListener('keydown', key); // Add keydown event listener

    // Report the IDs of interactive elements to the parent component
    if (onReady) {
      const items = Array.from(root.querySelectorAll(interactiveSelector))
        .filter(el => el.id && String(el.id).trim().length > 0) // Filter elements with valid IDs
        .map(el => {
          const label = el.querySelector('text')?.textContent?.trim() || ''; // Get label text
          return {
            id: el.id, // Element ID
            kind: inferKind(el), // Inferred type of the element
            name: label, // Label text (if available)
            svg: src, // Source of the SVG
          };
        });
      onReady(items); // Call onReady callback with items
    }

    return () => {
      root.removeEventListener('click', click); // Cleanup click event listener
      root.removeEventListener('keydown', key); // Cleanup keydown event listener
    };
  }, [markup, interactiveSelector, onSelect, onReady, src]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const escapeSelector = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
      }
      return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
    };

    const clearSource = (source) => {
      const nodes = hoverRefs.current.get(source);
      if (nodes) {
        nodes.forEach((node) => node.classList.remove('hover-highlight'));
        hoverRefs.current.delete(source);
      }
    };

    const clearAll = () => {
      hoverRefs.current.forEach((nodes) => nodes.forEach((node) => node.classList.remove('hover-highlight')));
      hoverRefs.current.clear();
    };

    const collectTargets = ({ selector, ids }) => {
      const rootEl = ref.current;
      if (!rootEl) return [];
      const collected = new Set();
      if (selector) {
        rootEl.querySelectorAll(selector).forEach((el) => {
          collected.add(el.closest('.building-group') || el);
        });
      }
      if (Array.isArray(ids)) {
        ids.forEach((id) => {
          if (!id) return;
          const escaped = escapeSelector(id);
          if (!escaped) return;
          const found = rootEl.querySelector(`#${escaped}`);
          if (found) {
            collected.add(found.closest('.building-group') || found);
          }
        });
      }
      return Array.from(collected).filter(Boolean);
    };

    const handleHover = (event) => {
      const detail = event.detail || {};
      const { source } = detail;
      if (!source) return;
      clearSource(source);
      const targets = collectTargets(detail);
      if (targets.length) {
        targets.forEach((node) => node.classList.add('hover-highlight'));
        hoverRefs.current.set(source, targets);
      }
    };

    const handleHoverClear = (event) => {
      const detail = event.detail || {};
      const { source } = detail;
      if (source) {
        clearSource(source);
      } else {
        clearAll();
      }
    };

    window.addEventListener('ggcmap-hover', handleHover);
    window.addEventListener('ggcmap-hover-clear', handleHoverClear);

    return () => {
      window.removeEventListener('ggcmap-hover', handleHover);
      window.removeEventListener('ggcmap-hover-clear', handleHoverClear);
      clearAll();
    };
  }, []);

  useEffect(() => {
    hoverRefs.current.forEach((nodes) => nodes.forEach((node) => node.classList.remove('hover-highlight')));
    hoverRefs.current.clear();
  }, [markup]);

  // Highlight the selected element and remove highlighting from the previous one
  useEffect(() => {
    const root = ref.current; // Reference to the SVG root element
    if (!root) return; // Exit if root is not available
    if (prev.current) {
      const p = root.querySelector(`#${CSS.escape(prev.current)}`); // Find previous element
      if (p) { 
        p.classList.remove('active-room'); // Remove active class
        p.setAttribute('aria-selected','false'); // Update aria-selected attribute
      }
    }
    if (selectedId) {
      const el = root.querySelector(`#${CSS.escape(selectedId)}`); // Find currently selected element
      if (el) { 
        el.classList.add('active-room'); // Add active class
        el.setAttribute('aria-selected','true'); // Update aria-selected attribute
      }
      prev.current = selectedId; // Update previous ID
    } else {
      prev.current = null; // Reset previous ID
    }
  }, [selectedId]);

  // Error handling: log the error and display a fallback UI
  if (error) {
    console.error('Error loading SVG:', error); // Log error
    return <div className="svg-error">Error loading SVG: {error}</div>; // Display error message
  }

  return (
    <div
      ref={ref} // Reference to the SVG container
      className={`inline-svg ${className}`} // Apply class names
      dangerouslySetInnerHTML={{ __html: markup }} // Set inner HTML to sanitized markup
      style={{ isolation: 'isolate' }} // Contain the shadow DOM
    />
  );
}
