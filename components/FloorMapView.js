'use client';
import { useState } from 'react';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';

export default function FloorMapView({
  src,
  interactiveSelector = '.room-group, .room, .label'
}) {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h5 mb-0">Floor Map</h1>
        <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>
      </div>
      <div className="border rounded-3">
        <ZoomPan initialScale={1} minScale={0.4} maxScale={6} className="w-100">
          <InlineSvg
            src={src}
            className="w-100 h-auto"
            interactiveSelector={interactiveSelector}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </ZoomPan>
      </div>
      <div className="mt-2 small text-muted">
        {selectedId ? <>Selected: <strong>{selectedId}</strong></> : 'Click a room to select.'}
      </div>
    </div>
  );
}
