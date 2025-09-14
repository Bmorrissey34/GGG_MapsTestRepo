import FloorMapView from '../../../components/FloorMapView';
import buildings from '../../../data/buildings.json';

export function generateStaticParams() {
  return buildings.map(b => ({ id: b.id }));
}

export default function BuildingPage({ params }) {
  const { id } = params;
  return (
    <div style={{ padding: '1rem' }}>
      <FloorMapView buildingId={id} />
    </div>
  );
}
