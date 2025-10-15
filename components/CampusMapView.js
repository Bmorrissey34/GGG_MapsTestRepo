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

    const wrapper = document.querySelector('.map-wrap-fullscreen') || document.querySelector('.map-wrap');
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

    // Attempt to center the map with retry logic
    const attemptFit = (attempt = 0) => {
        if (attempt > 3) return; // Max 3 attempts
      
      if (zoomRef.current && typeof zoomRef.current.fitToElement === 'function') {
        try {
          const success = zoomRef.current.fitToElement(svgRoot, {
              padding: 40,
              scaleMultiplier: 0.95
          });
          
            // If fit didn't succeed, try again after a longer delay
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
  }, [ensureStudentHousingClasses]);

  return (
    <PageContainer borderless={true}>
      <div className="map-wrap-fullscreen">
        {/* Disable autoFit so we can center manually */}
        <ZoomPan
          ref={zoomRef}
          initialScale={1}
          minScale={0.1}
          maxScale={6}
          className="map-viewport"
          disableDoubleClickZoom={true}
          autoFit={false}
          initMode="none"
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
