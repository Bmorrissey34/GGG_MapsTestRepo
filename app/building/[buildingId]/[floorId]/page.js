import FloorViewerPage from '../../../../components/pages/FloorViewerPage';
import buildings from '../../../../data/buildings.json';

export function generateStaticParams() {
  const params = [];
  for (const b of buildings) for (const f of b.floors) params.push({ buildingId: b.id, floorId: f.id });
  return params;
}

export default function Page({ params }) {
  return <FloorViewerPage buildingId={params.buildingId} floorId={params.floorId} />;
}
