import BuildingIndexPage from '../../../components/pages/BuildingIndexPage';
import buildings from '../../../data/buildings.json';

export function generateStaticParams() {
  return buildings.map(b => ({ buildingId: b.id }));
}

export default function Page({ params }) {
  return <BuildingIndexPage buildingId={params.buildingId} />;
}
