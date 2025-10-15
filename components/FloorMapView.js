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
  const zoomPanRef = useRef(null);
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

  // Post-process injected SVG: sizing, disable links, click selection, and centering
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgContent) return;

    // Normalize SVG sizing for responsive layout
    const svg = container.querySelector('svg');
    if (svg) {
      // Ensure viewBox is set for proper scaling and centering
      if (!svg.hasAttribute('viewBox')) {
        try {
          const bbox = svg.getBBox();
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
          }
        } catch (e) {
          // If getBBox fails, try to extract from width/height attributes
          const width = svg.getAttribute('width') || '1000';
          const height = svg.getAttribute('height') || '1000';
          svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
      }
      
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';
      svg.setAttribute('data-map-anchor', ''); // Mark as zoom target
      
      // Trigger ZoomPan to recenter after SVG is ready
      // Use multiple attempts to ensure proper centering
      const attemptFit = (attempt = 0) => {
          if (attempt > 3) return; // Max 3 attempts
        
        if (zoomPanRef.current && typeof zoomPanRef.current.fitToElement === 'function') {
          try {
            const success = zoomPanRef.current.fitToElement(svg, {
              padding: 40,
              scaleMultiplier: 0.9
            });
            
            // If fit didn't succeed, try again
              if (!success && attempt < 3) {
                setTimeout(() => attemptFit(attempt + 1), 150);
            }
          } catch (err) {
            console.log('Fit to element error:', err);
            // Retry on error
              if (attempt < 3) {
                setTimeout(() => attemptFit(attempt + 1), 150);
            }
          }
          } else if (attempt < 3) {
          // Ref not ready, try again
            setTimeout(() => attemptFit(attempt + 1), 150);
        }
      };
      
        // Start fitting attempts after DOM is ready
        setTimeout(() => attemptFit(0), 200);
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
      <PageContainer borderless={true}>
        <div className="map-wrap-fullscreen">
          <ZoomPan
            ref={zoomPanRef}
            initialScale={1}
            minScale={0.1}
            maxScale={6}
            className="map-viewport"
            disableDoubleClickZoom={true} // Disable double-click zoom
            autoFit={false}
            initMode="none"
            fitPadding={40}
            fitScaleMultiplier={0.9}
          >
            {/* Replaces <object> with inline SVG so pan/zoom work */}
            <div
              ref={containerRef}
              className="w-100 h-100"
              style={{ pointerEvents: 'auto' }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </ZoomPan>
        </div>
      </PageContainer>
      <div className="floor-selection-info">
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
