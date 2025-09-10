'use client';
import { useMemo, useState } from 'react';
import InlineSvg from '../../components/InlineSvg';

export default function MapClient({ floors }) {
  const [floorId, setFloorId] = useState(floors[0]?.id || null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);

  const current = useMemo(() => floors.find(f => f.id === floorId), [floors, floorId]);

  if (!floors.length) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          No SVGs found under <code>/public/Maps/Buildings/*/*.svg</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h5 mb-0">Map</h1>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={floorId || ''}
            onChange={(e) => { setFloorId(e.target.value); setSelectedId(null); }}
            aria-label="Choose floor"
          >
            {floors.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <div className="btn-group" role="group" aria-label="Zoom">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}>-</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoom(1)}>Reset</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}>+</button>
          </div>
        </div>
      </div>

      <div className="border rounded-3 bg-white p-2">
        {current ? (
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}>
            <InlineSvg
              src={current.file}               // e.g., /Maps/Buildings/Library/First-Floor-01.svg
              className="w-100 h-auto"
              interactiveSelector=".room-group, .building-group"
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        ) : (
          <div className="p-3 text-muted">No floor selected.</div>
        )}
      </div>

      <div className="mt-2 small text-muted">
        {selectedId ? <>Selected: <strong>{selectedId}</strong></> : 'Click an area to select.'}
      </div>
    </div>
  );
}
