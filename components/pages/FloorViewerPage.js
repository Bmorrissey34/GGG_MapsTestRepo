'use client';
import FloorMapView from '../../components/FloorMapView';
import buildings from '../../data/buildings.json';

export default function FloorViewerPage({ buildingId, floorId }) {
  // Find the building data based on the provided buildingId
  const b = buildings.find(x => x.id === buildingId);

  // Find the floor data within the building based on the provided floorId
  const f = b?.floors.find(x => x.id === floorId);

  // If the building or floor is not found, display a warning message and a back button
  if (!b || !f) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Not found: <code>{buildingId}/{floorId}</code>
        </div>
        <a className="btn btn-secondary" href={`/building/${buildingId}`}>
          Back to {buildingId}
        </a>
      </div>
    );
  }

  // Render the FloorMapView component with the source of the floor map file
  return <FloorMapView src={f.file} />;
}
