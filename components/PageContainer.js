// components/PageContainer.js
import Find from "../components/Find";
import Links from "../components/Links";

export default function PageContainer({ title, headerContent, children, className }) {
  // Combine default classes with any custom classes passed in as props
  const containerClasses = `container py-3 ${className || ''}`;

  return (
    <main className={containerClasses}>
      {/* Header section with title, Find component, and optional header content */}
      <div className="d-flex align-items-center justify-content-between mb-2">
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
        <Find />
        {headerContent}
      </div>

      {/* Main content area with a white background and rounded border */}
      <div
        className="border rounded-3"
        style={{ overflow: 'hidden', background: 'white' }}
      >
        {children}
      </div>

      {/* Footer section with Links component */}
      <Links />
    </main>
  );
}