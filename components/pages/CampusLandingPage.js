'use client';
import CampusMapView from '../../components/CampusMapView';

export default function CampusLandingPage() {
  // Render the CampusMapView component with the source of the campus map SVG
  return <CampusMapView src="/BuildingMaps/(Campus)/Campus.svg" />;
}
