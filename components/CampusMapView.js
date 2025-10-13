// components/CampusMapView.js
'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';
import buildings from '../data/buildings.json';

// CampusMapView component displays the campus map with interactive elements
export default function CampusMapView({
  src = '/BuildingMaps/(Campus)/Campus.svg', // Default path to the campus map SVG
  interactiveSelector = '.building-group, .building', // CSS selector for interactive elements
}) {
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();

  // Create a set of known building IDs for quick lookup
  const known = useMemo(
    () => new Set(buildings.map((b) => String(b.id).toUpperCase())),
    []
  );

  // Handle the selection of a building
  const handleSelect = (id) => {
    if (!id) return;
    setSelectedId(id);
    const code = String(id).toUpperCase();
    if (known.has(code)) {
      router.push(`/building/${code}`);
    }
  };

  // Ensure student housing groups carry a helper class for interactivity
  const ensureStudentHousingClasses = useCallback(() => {
    const svgRoot = document.querySelector('.map-wrap svg');
    if (!svgRoot) return;

    const studentHousingSelectors = [
      "[id='1000']",
      "[id='2000']",
      "[id='3000']",
      '#BUILDING_1000',
      '#BUILDING_2000',
      '#BUILDING_3000',
      "[id='b1000']",
      "[id='2']",
      "[id='3']",
    ];

    studentHousingSelectors.forEach((selector) => {
      svgRoot.querySelectorAll(selector).forEach((node) => {
        node.classList.add('student-housing');
        if (node.classList.contains('building-group')) {
          node.querySelectorAll('.building').forEach((child) => {
            child.classList.add('student-housing');
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    ensureStudentHousingClasses();
  }, [ensureStudentHousingClasses, src]);

  // Optional: call imperative fit if your ZoomPan forwards a ref
  const zoomRef = useRef(null);

  // Runs once the SVG markup is injected
  const handleSvgReady = useCallback(() => {
    ensureStudentHousingClasses();

    const wrapper = document.querySelector('.map-wrap');
    const svgRoot = wrapper?.querySelector('svg');
    if (!svgRoot) return;

    svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgRoot.setAttribute('data-map-anchor', '');

    svgRoot.querySelectorAll('[data-map-anchor]').forEach((el) => {
      if (el !== svgRoot) el.removeAttribute('data-map-anchor');
    });

    // Clear any transforms we may have set previously during experiments
    const mainGroup =
      svgRoot.querySelector('g#campus, g#Campus') || svgRoot.querySelector('svg > g');
    if (mainGroup) {
      mainGroup.removeAttribute('transform');
    }

    if (zoomRef.current && typeof zoomRef.current.fitToElement === 'function') {
      try {
        zoomRef.current.fitToElement(svgRoot, {
          padding: 0,
          scaleMultiplier: 0.15
        });
      } catch {
        // ignore if not supported
      }
    }
    if (zoomRef.current && typeof zoomRef.current.centerOn === 'function') {
      try {
        const bbox = svgRoot.getBBox(); // get map bounding box
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        zoomRef.current.centerOn(centerX, centerY);
      } catch {
        // ignore if not supported
      }
    }
  }, [ensureStudentHousingClasses]);

  // Header helper text
  const headerContent = (
    <span className="text-muted small">
      Use +/- buttons or scroll/pinch to zoom; drag to pan
    </span>
  );

  return (
    <PageContainer title="Campus Map" headerContent={headerContent} fluid={true}>
      <div className="map-wrap">
        {/* Disable autoFit so we can center manually */}
        <ZoomPan
          ref={zoomRef}
          initialScale={1}
          minScale={0.1}
          maxScale={6}
          className="map-viewport"
          disableDoubleClickZoom={true}
          autoFit={false}
          fitPadding={0}
          fitScaleMultiplier={0.70}
        >
          <InlineSvg
            src={src}
            className="w-100 h-100"
            interactiveSelector={interactiveSelector}
            selectedId={selectedId}
            onSelect={handleSelect}
            onReady={handleSvgReady}
          />
        </ZoomPan>

      </div>
    </PageContainer>
  );
}
