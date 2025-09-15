// components/FloorMapView.js
'use client';
import { useState } from 'react';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';

export default function FloorMapView({ src, interactiveSelector = '.room-group, .room, .label' }) {
  const [selectedId, setSelectedId] = useState(null);

  // Content for the right side of the header, providing user instructions
  const headerContent = <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>;

  // Handles the selection of a room or area on the map
  const handleSelect = (id) => {
    if (id) {
      const normalizedPath = `/Building/${id}`; // Construct the URL for navigation
      window.location.href = normalizedPath; // Navigate to the selected building and floor
    }
  };

  return (
    // Render the floor map viewer with zoom/pan functionality and selection handling
    <>
      <PageContainer title="Floor Map" headerContent={headerContent}>
        <ZoomPan
          initialScale={1}
          minScale={0.4}
          maxScale={6}
          className="w-100"
          disableDoubleClickZoom={true} // Disable double-click zoom to avoid interference with single-click events
        >
          <InlineSvg
            src={src} // Path to the SVG file representing the floor map
            className="w-100 h-auto" // Ensure the SVG scales properly within the container
            interactiveSelector={interactiveSelector} // CSS selector for interactive elements
            selectedId={selectedId} // Currently selected element ID
            onSelect={(id) => {
              setSelectedId(id); // Update the selected ID state
              handleSelect(id); // Navigate to the selected room or area
            }}
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