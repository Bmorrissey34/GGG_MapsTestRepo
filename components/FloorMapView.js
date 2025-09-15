// components/FloorMapView.js
'use client';
import { useState, useEffect, useRef } from 'react';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';

// FloorMapView component for rendering an interactive floor map
export default function FloorMapView({ src, interactiveSelector = '.room-group, .room, .label' }) {
  const [selectedId, setSelectedId] = useState(null); // State to track the selected room ID
  const [svgContent, setSvgContent] = useState('');
  const containerRef = useRef(null);

  // Content for the header providing user instructions
  const headerContent = <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>;

  // Handles the selection of a room or area on the map
  const handleSelect = (id) => {
    if (id) {
      setSelectedId(id); // Update the selected ID state
    }
  };

  // Load SVG as text so events bubble to ZoomPan
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const text = await res.text();
        if (isMounted) setSvgContent(text);
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
      const target =
        e.target.closest(interactiveSelector) ||
        e.target.closest('[id]');
      if (target) {
        e.preventDefault();
        handleSelect(target.id || target.getAttribute('id'));
      }
    };

    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [svgContent, interactiveSelector]);

  return (
    // Render the floor map viewer with zoom/pan functionality and selection handling
    <>
      <PageContainer title="Floor Map" headerContent={headerContent}>
        <ZoomPan
          initialScale={1}
          minScale={0.4}
          maxScale={6}
          className="w-100"
          disableDoubleClickZoom={true} // Disable double-click zoom
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