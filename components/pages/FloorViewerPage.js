'use client';
import FloorMapView from '../../components/FloorMapView';
import buildings from '../../data/buildings.json';

export default function FloorViewerPage({ buildingId, floorId }) {
  const b = buildings.find(x => x.id === buildingId);
  const f = b?.floors.find(x => x.id === floorId);
  if (!b || !f) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Not found: <code>{buildingId}/{floorId}</code>
        </div>
        <a className="btn btn-secondary" href={`/building/${buildingId}`}>Back to {buildingId}</a>
      </div>
    );
  }
  return <FloorMapView src={f.file} />;
}
