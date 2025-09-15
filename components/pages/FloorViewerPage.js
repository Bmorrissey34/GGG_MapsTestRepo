'use client';
import { useRouter } from 'next/navigation';
import FloorMapView from '../FloorMapView';
import { getBuildingData } from '../../lib/campus';

// FloorViewerPage component for displaying a specific floor of a building
export default function FloorViewerPage({ buildingId, floorId }) {
  const router = useRouter(); // Router for navigation
  const buildingData = getBuildingData(buildingId); // Fetch building data
  const floors = buildingData?.floors || []; // Get floors or default to empty array
  const currentFloorIndex = floors.findIndex(floor => floor.id === floorId); // Find current floor index
  const currentFloor = floors[currentFloorIndex]; // Get current floor data

  // Navigate to the upper floor
  const goToUpperFloor = () => {
    if (currentFloorIndex < floors.length - 1) {
      router.push(`/building/${buildingId}/${floors[currentFloorIndex + 1].id}`); // Navigate to upper floor
    }
  };

  // Navigate to the lower floor
  const goToLowerFloor = () => {
    if (currentFloorIndex > 0) {
      router.push(`/building/${buildingId}/${floors[currentFloorIndex - 1].id}`); // Navigate to lower floor
    }
  };

  if (!buildingData || !currentFloor) {
    return <div>Floor not found</div>; // Display message if floor not found
  }

  return (
    <div className="floor-viewer">
      {/* Floor Map with Navigation Overlay */}
      <div className="floor-content">
        <FloorMapView src={currentFloor.file} /> {/* Render the floor map */}
        
        {/* Vertical Floor Navigation Overlay */}
        <div className="floor-navigation-overlay">
          <button 
            onClick={goToUpperFloor}
            disabled={currentFloorIndex === floors.length - 1} // Disable if on top floor
            className="nav-arrow-vertical"
            title="Upper Floor"
          >
            ↑
          </button>
          
          <div className="floor-display-vertical">
            <span className="current-floor-vertical">{currentFloor.label}</span> {/* Display current floor label */}
            <span className="building-name-vertical">{buildingData.name}</span> {/* Display building name */}
          </div>
          
          <button 
            onClick={goToLowerFloor}
            disabled={currentFloorIndex === 0} // Disable if on ground floor
            className="nav-arrow-vertical"
            title="Lower Floor"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}
