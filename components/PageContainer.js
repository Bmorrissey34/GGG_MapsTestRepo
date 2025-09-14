// components/PageContainer.js
import Find from "../components/Find";
import Links from "../components/Links";
export default function PageContainer({ title, headerContent, children, className }) {
  // We combine the default classes with any custom classes you pass in.
  const containerClasses = `container py-3 ${className || ''}`;

  return (
    <main className={containerClasses}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h4 mb-0" style={{ fontFamily: "var(--justin-globe1)",color: "var(--justin-globe1-color)", fontWeight: "var(--justin-globe1-bold)"}}>{title}</h1>
        <Find></Find>
        {headerContent}
      </div>
      <div className="border rounded-3" style={{ overflow: 'hidden', background: 'white' }}>
        {children}
      </div>
      <Links></Links>
    </main>
  );
}