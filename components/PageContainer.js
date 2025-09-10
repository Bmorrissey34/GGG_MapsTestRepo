// components/PageContainer.js

export default function PageContainer({ title, headerContent, children, className }) {
  // We combine the default classes with any custom classes you pass in.
  const containerClasses = `container py-3 ${className || ''}`;

  return (
    <main className={containerClasses}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="h5 mb-0">{title}</h1>
        {headerContent}
      </div>
      <div className="border rounded-3" style={{ overflow: 'hidden', background: 'white' }}>
        {children}
      </div>
    </main>
  );
}