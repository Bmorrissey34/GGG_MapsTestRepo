'use client';
import { useState } from 'react';
import InlineSvg from '../components/InlineSvg';
import ZoomPan from '../components/ZoomPan';

export default function MapPage() {
  const SRC = '/BuildingMaps/(Campus)/Campus.svg';
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h5 mb-0">Campus Map</h1>
        <span className="text-muted small">Scroll to zoom • drag to pan • dbl-click to zoom</span>
      </div>

      <div className="border rounded-3">
        <ZoomPan
          initialScale={1}
          minScale={0.4}
          maxScale={6}
          className="w-100" // fills the container
        >
          <InlineSvg
            src={SRC}
            className="w-100 h-auto"
            interactiveSelector=".building-group, .building"
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </ZoomPan>
      </div>

      <div className="mt-2 small text-muted">
        {selectedId ? <>Selected: <strong>{selectedId}</strong></> : 'Click a building to select.'}
      </div>
    </div>
  );
}
