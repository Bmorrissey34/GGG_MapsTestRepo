// components/CampusMapView.js
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Legend from './legend';          // keep lowercase to match legend.jsx
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';
import buildings from '../data/buildings.json';

export default function CampusMapView({
  src = '/BuildingMaps/(Campus)/Campus.svg',
  interactiveSelector = '.building-group, .building',
}) {
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();

  const known = useMemo(
    () => new Set(buildings.map((b) => b.id.toUpperCase())),
    []
  );

  const handleSelect = (id) => {
    if (!id) return;
    setSelectedId(id);
    const code = id.toUpperCase();
    if (known.has(code)) {
      router.push(`/BuildingMaps/${code}`);
    }
  };

  const headerContent = (
    <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>
  );

  return (
    <PageContainer title="Campus Map" headerContent={headerContent}>
      {/* Wrap the SVG so Legend can scope its coloring */}
      <div className="map-wrap">
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

      {/* Legend is always visible; it will color elements inside .map-wrap svg */}
      <Legend
        locale={
          typeof navigator !== 'undefined'
            ? navigator.language.split('-')[0]
            : 'en'
        }
        mapScopeSelector=".map-wrap svg"
      />
    </PageContainer>
  );
}
