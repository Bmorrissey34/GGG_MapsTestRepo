// components/PageContainer.js

// PageContainer component serves as a layout wrapper for pages
export default function PageContainer({
  children,
  title,
  headerContent,
  fluid = false // Add a fluid prop, default to false
}) {
  const containerClass = fluid ? "container-fluid px-0" : "container mt-3";

  return (
    <div className={containerClass}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1
          className="h4 mb-0"
          style={{
            fontFamily: "var(--justin-globe1)",
            color: "var(--justin-globe1-color)",
            fontWeight: "var(--justin-globe1-bold)"
          }}
        >
          {title}
        </h1>
         {/* Search component old spot for the find*/}
        {headerContent} {/* Optional additional header content */}
      </div>

      {/* Main content area with a white background and rounded border */}
      <div
        className="border rounded-3 page-container-inner"
        style={{ overflow: 'hidden', background: 'white' }}
      >
        {children} {/* Render child components */}
      </div>

    </div>
  );
}
