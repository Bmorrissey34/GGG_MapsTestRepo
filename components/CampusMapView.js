// components/CampusMapView.js
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Legend from './legend';
import InlineSvg from './InlineSvg';
import ZoomPan from './ZoomPan';
import PageContainer from './PageContainer';
import buildings from '../data/buildings.json';

// Color map synced with your legend
const colorMap = {
  "Academic Building": "#0f5132",
  "Student Housing": "#6b21a8",   // violet
  "Faculty/Staff": "#e874be",
  "Residents": "#e8bf74",
  "Students": "#86efac",
  "Handicap": "#93c5fd",
  "Restricted Area": "#9ca3af"
};

// CampusMapView component displays the campus map with interactive elements
export default function CampusMapView({
  src = '/BuildingMaps/(Campus)/Campus.svg', // Default path to the campus map SVG
  interactiveSelector = '.building-group, .building', // CSS selector for interactive elements
}) {
  const [selectedId, setSelectedId] = useState(null); // State to track the selected building ID
  const router = useRouter(); // Next.js router for navigation

  // Create a set of known building IDs for quick lookup
  const known = useMemo(
    () => new Set(buildings.map((b) => b.id.toUpperCase())),
    []
  );

  // Handle the selection of a building
  const handleSelect = (id) => {
    if (!id) return; // Ignore if no ID is provided
    setSelectedId(id); // Update the selected ID state
    const code = id.toUpperCase(); // Normalize the ID to uppercase
    if (known.has(code)) {
      router.push(`/building/${code}`); // Navigate to the selected building
    }
  };

  // Apply colors to buildings after SVG is loaded
  useEffect(() => {
    const svgRoot = document.querySelector('.map-wrap svg');
    if (!svgRoot) return;

    // Example: If Building 3000 should be Student Housing, give it a class
    const b3000 = svgRoot.querySelector('#3000, #BUILDING_3000');
    if (b3000) {
      b3000.classList.add('student-housing');
    }

    // Apply fill colors based on classes
    Object.entries(colorMap).forEach(([label, color]) => {
      const cls = label.toLowerCase().replace(/\s+/g, '-'); // e.g. "Student Housing" -> "student-housing"
      svgRoot.querySelectorAll(`.${cls}`).forEach((el) => {
        el.style.fill = color;
      });
    });
  }, [src]);

  // Content for the header, providing user instructions
  const headerContent = (
    <span className="text-muted small">Scroll/pinch to zoom • drag to pan</span>
  );

  return (
    <PageContainer title="Campus Map" headerContent={headerContent}>
      {/* Container for the map and its interactive elements */}
      <div className="map-wrap">
        <ZoomPan
          initialScale={1} // Default zoom level
          minScale={0.4}   // Minimum zoom level
          maxScale={6}     // Maximum zoom level
          className="w-100" // Full width styling
          disableDoubleClickZoom={true} // Disable double-click zoom to avoid interference
        >
          <InlineSvg
            src={src} // Path to the campus map SVG
            className="w-100 h-auto" // Ensure the SVG scales properly within the container
            interactiveSelector={interactiveSelector} // CSS selector for interactive elements
            selectedId={selectedId} // Currently selected building ID
            onSelect={handleSelect} // Callback for handling building selection
          />
        </ZoomPan>
      </div>

      {/* Legend component for coloring and labeling map elements */}
      <Legend
        locale={
          typeof navigator !== 'undefined'
            ? navigator.language.split('-')[0] // Use the browser's language setting
            : 'en' // Default to English if navigator is unavailable
        }
        mapScopeSelector=".map-wrap svg" // Scope the legend to the SVG inside the map-wrap
      />
    </PageContainer>
  );
}
