// components/FloorMapView.js
'use client';
import { useState, useEffect, useRef } from 'react';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';

// Strip scripts and inline handlers embedded in the SVG source
const sanitizeSvgMarkup = (markup) =>
  markup
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\s(xlink:)?href=["']\s*javascript:[^"']*["']/gi, ' ');

// FloorMapView component for rendering an interactive floor map
export default function FloorMapView({ src, interactiveSelector = '.room-group, .room, .label' }) {
  const [selectedId, setSelectedId] = useState(null); // State to track the selected room ID
  const [svgContent, setSvgContent] = useState('');
  const containerRef = useRef(null);
  const prevHighlightedRef = useRef(null);

  const escapeSelectorId = (value) => {
    if (!value) return '';
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(value);
    }
    return String(value).replace(/([ -\\/:-@[-`{-~])/g, '\\$1');
  };

  // Content for the header providing user instructions
  const headerContent = <span className="text-muted small">Use +/- buttons or scroll/pinch to zoom; drag to pan</span>;

  // Handles the selection of a room or area on the map
  const handleSelect = (id) => {
    if (id) {
      setSelectedId(String(id).trim()); // Update the selected ID state
    }
  };

  // Load SVG as text so events bubble to ZoomPan
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const raw = await res.text();
        const sanitized = sanitizeSvgMarkup(raw);
        if (isMounted) setSvgContent(sanitized);
      } catch {
        if (isMounted) setSvgContent('<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20">Failed to load map</text></svg>');
      }
    })();
    return () => { isMounted = false; };
  }, [src]);

  // Post-process injected SVG: sizing, disable links, and click selection
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgContent) return;

    // Normalize SVG sizing for responsive layout
    const svg = container.querySelector('svg');
    if (svg) {
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.display = 'block';
    }

    // Disable navigation inside the SVG
    container.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        link.setAttribute('data-original-href', href);
        link.removeAttribute('href');
      }
    });

    // Delegate click to capture element IDs
    const onClick = (e) => {
      const clickable =
        e.target.closest(interactiveSelector) ||
        e.target.closest('[id]');
      if (!clickable) return;
      e.preventDefault();
      const group = clickable.closest('.room-group');
      const idSource = group?.id || clickable.id || clickable.getAttribute('id');
      if (idSource) {
        handleSelect(idSource.trim());
      }
    };

    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [svgContent, interactiveSelector]);

  useEffect(() => {
    const container = containerRef.current;
    const prevEl = prevHighlightedRef.current;

    if (prevEl?.isConnected) {
      prevEl.classList.remove('active-room');
      prevEl.removeAttribute('aria-selected');
      prevHighlightedRef.current = null;
    }

    if (!container || !svgContent || !selectedId) return;

    const escapedId = escapeSelectorId(selectedId);
    if (!escapedId) return;

    const candidate = container.querySelector(`#${escapedId}`);
    const target = candidate?.closest('.room-group') || candidate;

    if (target) {
      target.classList.add('active-room');
      target.setAttribute('aria-selected', 'true');
      prevHighlightedRef.current = target;
    }
  }, [selectedId, svgContent]);

  return (
    // Render the floor map viewer with zoom/pan functionality and selection handling
    <>
      <PageContainer title="Floor Map" headerContent={headerContent} fluid={true}>
        <ZoomPan
          initialScale={1}
          minScale={0.25}
          maxScale={6}
          className="w-100"
          disableDoubleClickZoom={true} // Disable double-click zoom
          autoFit={true}
          fitPadding={24}
        >
          {/* Replaces <object> with inline SVG so pan/zoom work */}
          <div
            ref={containerRef}
            className="w-100 h-auto"
            style={{ pointerEvents: 'auto' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </ZoomPan>
      </PageContainer>
      <div className="container mt-2 small text-muted">
        {selectedId ? (
          // Display the selected room or area ID
          <>
            Selected: <strong>{selectedId}</strong>
          </>
        ) : (
          // Prompt the user to click a room if none is selected
          'Click a room to select.'
        )}
      </div>
    </>
  );
}
