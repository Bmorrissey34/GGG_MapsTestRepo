// components/FloorMapView.js
'use client';
import { useState } from 'react';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer'; // <-- Import the new container

export default function FloorMapView({ src, interactiveSelector = '.room-group, .room, .label' }) {
  const [selectedId, setSelectedId] = useState(null);

  // Content for the right side of the header
  const headerContent = <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>;

  return (
    // Use a React Fragment to render the container and the selection text
    <>
      <PageContainer title="Floor Map" headerContent={headerContent}>
        <ZoomPan initialScale={1} minScale={0.4} maxScale={6} className="w-100">
          <InlineSvg
            src={src}
            className="w-100 h-auto"
            interactiveSelector={interactiveSelector}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </ZoomPan>
      </PageContainer>
      <div className="container mt-2 small text-muted">
        {selectedId ? (
          <>
            Selected: <strong>{selectedId}</strong>
          </>
        ) : (
          'Click a room to select.'
        )}
      </div>
    </>
  );
}