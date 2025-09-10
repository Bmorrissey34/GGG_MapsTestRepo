// app/layout.js
import Script from 'next/script';

<style>{`
  .border .zooming, .border:active { cursor: grabbing; }
`}</style>

export const metadata = {
  title: 'GGC Campus Map',
  description: 'Interactive campus map MVP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Mobile-friendly */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Bootstrap CSS (CDN) */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>

      <body className="bg-light">
        {children}

        {/* Bootstrap JS (for dropdowns/modals if you use them later) */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
