'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import buildings from '../data/buildings.json';

export default function CampusMapView({
  src = '/BuildingMaps/(Campus)/Campus.svg',
  interactiveSelector = '.building-group, .building'
}) {
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();
  const known = useMemo(() => new Set(buildings.map(b => b.id.toUpperCase())), []);

  const handleSelect = (id) => {
    if (!id) return;
    setSelectedId(id);
    const code = id.toUpperCase();
    if (known.has(code)) router.push(`/building/${code}`);
  };

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h5 mb-0">Campus Map</h1>
        <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>
      </div>
      <div className="border rounded-3">
        <ZoomPan initialScale={1} minScale={0.4} maxScale={6} className="w-100">
          <InlineSvg
            src={src}
            className="w-100 h-auto"
            interactiveSelector={interactiveSelector}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </ZoomPan>
      </div>
    </div>
  );
}
