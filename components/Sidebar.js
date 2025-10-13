'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllBuildings } from '../lib/campus';

// Get building data and create navigation items
const buildings = getAllBuildings();
const SPECIAL_HOVER_SELECTORS = {
  '1000': '#BUILDING_1000, [id="1000"], [id="b1000"]',
  '2000': '#BUILDING_2000, [id="2000"], [id="2"]',
  '3000': '#BUILDING_3000, [id="3000"], [id="3"]',
};

const buildHoverDetail = (building) => {
  const selector = SPECIAL_HOVER_SELECTORS[building.id];
  if (selector) {
    return { selector };
  }
  const hoverId = typeof building.id === 'string' ? building.id.toLowerCase() : String(building.id).toLowerCase();
  return { ids: [hoverId] };
};

const NAV_ITEMS = [
  { key: 'campus', label: 'Campus', path: '/', hover: { selector: '.building-group' } },
  ...buildings
    .slice()
    .sort((a, b) => {
      const priorityA = ['1000', '2000', '3000'].includes(a.id) ? 1 : 0;
      const priorityB = ['1000', '2000', '3000'].includes(b.id) ? 1 : 0;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.name.localeCompare(b.name);
    })
    .map((building) => ({
      key: building.id,
      label: building.name,
      path: `/building/${building.id}`,
      hover: buildHoverDetail(building),
    }))
];

const dispatchHoverEvent = (type, source, detail) => {
  if (typeof window === 'undefined') return;
  const eventDetail = { source, ...(detail ?? {}) };
  window.dispatchEvent(new CustomEvent(type, { detail: eventDetail }));
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleCollapse = () => {
    dispatchHoverEvent('ggcmap-hover-clear', 'sidebar:collapse');
    setCollapsed(true);
  };

  const handleExpand = () => setCollapsed(false);

  const createHandlers = (item) => {
    const source = `sidebar:${item.key}`;
    const hoverDetail = item.hover;
    return {
      onMouseEnter: () => hoverDetail && dispatchHoverEvent('ggcmap-hover', source, hoverDetail),
      onMouseLeave: () => dispatchHoverEvent('ggcmap-hover-clear', source),
      onFocus: () => hoverDetail && dispatchHoverEvent('ggcmap-hover', source, hoverDetail),
      onBlur: () => dispatchHoverEvent('ggcmap-hover-clear', source),
    };
  };

  return (
    <div className={`sidebar-slot${collapsed ? ' is-collapsed' : ''}`}>
      {!collapsed ? (
        <nav className="sidebar" aria-label="Campus navigation">
          <div className="sidebar-header">
            <span className="sidebar-title">Explore Campus</span>
            <button
              type="button"
              className="sidebar-collapse"
              onClick={handleCollapse}
              aria-label="Collapse sidebar navigation"
            >
              <i className="bi bi-chevron-left" aria-hidden="true"></i>
            </button>
          </div>
          <ul className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const handlers = createHandlers(item);
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              const linkClass = `nav-link${isActive ? ' active' : ''}`;
              return (
                <li key={item.key} className="nav-item">
                  <Link
                    className={linkClass}
                    href={item.path}
                    {...handlers}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <div className="sidebar-toggle-wrap">
          <button
            type="button"
            className="sidebar-toggle btn btn-sm btn-outline-secondary"
            onClick={handleExpand}
            aria-label="Expand sidebar navigation"
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
            <span className="visually-hidden">Expand sidebar navigation</span>
          </button>
        </div>
      )}
    </div>
  );
};
