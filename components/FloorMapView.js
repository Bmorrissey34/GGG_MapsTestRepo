// components/FloorMapView.js
'use client';
import { useState, useEffect, useRef } from 'react';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';

// FloorMapView component for rendering an interactive floor map
export default function FloorMapView({ src, interactiveSelector = '.room-group, .room, .label' }) {
  const [selectedId, setSelectedId] = useState(null); // State to track the selected room ID
  const svgRef = useRef(null); // Reference to the SVG element

  // Content for the header providing user instructions
  const headerContent = <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>;

  // Handles the selection of a room or area on the map
  const handleSelect = (id) => {
    if (id) {
      setSelectedId(id); // Update the selected ID state
    }
  };

  useEffect(() => {
    const handleSvgLoad = () => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      // Get the SVG document
      const svgDoc = svgElement.contentDocument;
      if (!svgDoc) return;

      // Add click event listener to prevent default navigation
      svgDoc.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default behavior (navigation)
        e.stopPropagation(); // Stop event from bubbling

        // Find the closest interactive element
        const target = e.target.closest('g[id], rect[id], path[id], circle[id], polygon[id]');
        if (target && target.id) {
          handleSelect(target.id); // Select the room if an interactive element is clicked
        }
      });

      // Remove any existing href attributes that cause navigation
      const links = svgDoc.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          link.setAttribute('data-original-href', href); // Store original href
          link.removeAttribute('href'); // Remove href to prevent navigation
        }
      });
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('load', handleSvgLoad);
      
      // If already loaded
      if (svgElement.contentDocument) {
        handleSvgLoad();
      }
    }

    return () => {
      if (svgElement) {
        svgElement.removeEventListener('load', handleSvgLoad); // Cleanup event listener
      }
    };
  }, [src]);

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
          <object 
            ref={svgRef}
            data={src} // Path to the SVG file representing the floor map
            type="image/svg+xml"
            className="w-100 h-auto" // Ensure the SVG scales properly
            style={{ pointerEvents: 'auto' }}
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