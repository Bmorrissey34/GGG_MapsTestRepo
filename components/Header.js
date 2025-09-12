// components/Header.js
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="header-logo-link">
          <Image
            src="/images/ggc-logo.png" // <-- IMPORTANT: Replace with your logo's path
            alt="GGC Logo"
            width={40} // Adjust width as needed
            height={40} // Adjust height as needed
            priority // Makes the logo load faster
            style={{border: "var(--justin-globe3-border)"}}
          />
          <span className="header-title">GGC Maps</span>
        </Link>
        {/* You can add navigation links here if needed */}
      </div>
    </header>
  );
}