'use client';
import { useState, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleToggle = () => {
    if (isOpen) {
      dispatchHoverEvent('ggcmap-hover-clear', 'sidebar:toggle');
    }
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    dispatchHoverEvent('ggcmap-hover-clear', 'sidebar:close');
    setIsOpen(false);
  };

  // Manage body scroll and click outside
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.classList.add('sidebar-open');
      
      // Close sidebar when clicking outside
      const handleClickOutside = (e) => {
        const sidebar = document.querySelector('.hamburger-sidebar-panel');
        const toggle = document.querySelector('.hamburger-toggle-btn');
        if (sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
          handleClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.body.classList.remove('sidebar-open');
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

  // Close sidebar on route change
  useEffect(() => {
    handleClose();
  }, [pathname]);

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
    <>
      {/* Hamburger toggle button - positioned in top left */}
      <button
        type="button"
        className="hamburger-toggle-btn"
        onClick={handleToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true"></i>
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div 
          className="hamburger-overlay" 
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <nav 
        className={`hamburger-sidebar-panel${isOpen ? ' is-open' : ''}`}
        aria-label="Campus navigation"
      >
        <div className="hamburger-sidebar-header">
          <span className="hamburger-sidebar-title">Explore Campus</span>
          <button
            type="button"
            className="hamburger-close-btn"
            onClick={handleClose}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
        <ul className="hamburger-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const handlers = createHandlers(item);
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const linkClass = `hamburger-nav-link${isActive ? ' active' : ''}`;
            return (
              <li key={item.key} className="hamburger-nav-item">
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
    </>
  );
};
