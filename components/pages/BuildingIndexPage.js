'use client';
import Link from 'next/link';
import buildings from '../../data/buildings.json';

export default function BuildingIndexPage({ buildingId }) {
  const b = buildings.find(x => x.id === buildingId);
  if (!b) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Not found: <code>{buildingId}</code></div>
        <a className="btn btn-secondary" href="/">Back to Campus</a>
      </div>
    );
  }
  return (
    <div className="container py-4">
      <h1 className="h5 mb-3">Building {b.id}</h1>
      <ul className="list-group">
        {b.floors.map(f => (
          <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
            {f.label} <span className="text-muted">({f.id})</span>
            <Link className="btn btn-sm btn-primary" href={`/building/${b.id}/${f.id}`}>Open</Link>
          </li>
        ))}
      </ul>
      <div className="mt-3"><a href="/" className="btn btn-outline-secondary btn-sm">← Back to Campus</a></div>
    </div>
  );
}
