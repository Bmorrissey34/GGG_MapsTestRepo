# GGC Maps - AI Coding Agent Instructions

## Project Overview
This is a Next.js app that rebuilds Georgia Gwinnett College's campus mapping system with modern frameworks. The app displays interactive SVG-based campus and building floor maps with zoom/pan functionality.

## Architecture & Key Patterns

### App Router Structure
- Uses Next.js 14 App Router with dynamic routes: `/building/[buildingId]/[floorId]`
- Static generation via `generateStaticParams()` in route files
- Building data drives route generation from `data/buildings.json`

### Core Component Hierarchy
```
RootLayout (app/layout.js)
├── Header/Footer (global)
├── Sidebar (navigation)
├── Main Content Area
│   ├── CampusMapView (campus overview)
│   └── FloorMapView (individual floor maps)
└── Legend + Links (right rail)
```

### SVG Map Integration Pattern
- Maps are fetched as raw SVG markup, not as components
- Interactive elements use CSS selectors (`.building-group`, `.room-group`) 
- Hover states applied via CSS classes (`hover-highlight`, `active-room`)
- Room/building IDs match between SVG elements and JSON data

## Critical Developer Workflows

### Development Commands
```bash
npm run dev          # Start development server
npm run extract-rooms # Extract room data from SVG files (data processing)
```

### Adding New Buildings/Floors
1. Add SVG file to `/public/BuildingMaps/[BuildingId]/`
2. Update `data/buildings.json` with new building/floor entry
3. Routes auto-generate via `generateStaticParams()`

### CSS Global Variables System
The project uses extensive CSS custom properties in `app/global.css`:
- Responsive units: `--base-font-size`, `--spacing-unit`
- Team member prefixed variables (e.g., `--justin-globe1`, `--bm-header-bg`)
- Layout dimensions: `--sidebar-width`, `--sidebar-collapsed-width`

## Component-Specific Patterns

### ZoomPan Component (`components/ZoomPan.js`)
- Custom pan/zoom implementation (not using external libraries)
- Uses `data-map-anchor` attribute to identify zoom targets
- Auto-fit functionality via `fitToElement()` method
- Handles both mouse/touch interactions

### Map View Components
- **CampusMapView**: Campus overview with building selection
- **FloorMapView**: Individual floor plans with room selection
- Both use `InlineSvg` wrapper for SVG injection
- Interactive selectors configurable via props

### Data Layer (`lib/campus.js`)
- Centralized building data access functions
- `getBuildingData()`, `getAllBuildings()` for component consumption
- Static param generation for Next.js build process

## Integration Points

### SVG Processing
- SVGs sanitized on load (strip scripts, inline handlers)
- CSS class manipulation for interactivity via `querySelector`
- Building IDs must match between SVG element IDs and `buildings.json`

### State Management
- Local component state (useState) - no global state management
- URL-driven navigation via Next.js router
- Interactive selections handled through CSS class toggling

## Project-Specific Conventions

### File Naming
- Components: PascalCase (e.g., `CampusMapView.js`)
- Pages: lowercase with brackets for dynamic routes
- Data files: kebab-case JSON in `/data` directory

### CSS Architecture
- Global styles in `app/global.css` with CSS custom properties
- Bootstrap 5 integration for base styling
- Component-specific styles embedded in global CSS (no CSS modules)

### SVG Map Requirements
- Interactive elements need specific CSS classes
- Student housing requires `.student-housing` class
- Room elements need `.room-group` or `.room` classes
- Building elements need `.building-group` or `.building` classes

## Testing & Debugging

### Map Debugging
- Use browser dev tools to inspect SVG DOM after injection
- Check CSS class application on interactive elements
- Verify `data-map-anchor` attribute presence for zoom targeting

### Common Issues
- SVG not loading: Check path in `buildings.json` matches file location
- Interactivity broken: Verify CSS selectors match SVG element classes
- Zoom/pan issues: Ensure `data-map-anchor` is properly set

## External Dependencies
- Bootstrap 5 + Bootstrap Icons for UI components
- Cheerio/JSDOM for server-side SVG processing (room extraction script)
- No external mapping libraries - custom zoom/pan implementation