// components/Header.js
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="header-logo-link">
          <Image
            src="/images/ggc-logo.png" 
            alt="GGC Logo"
            width={40} 
            height={40} 
            priority 
            style={{border: "var(--justin-globe3-border)"}}
          />
          <span className="header-title">GGC Maps</span>
        </Link>
        {/* You can add navigation links here if needed */}
      </div>
    </header>
  );
}