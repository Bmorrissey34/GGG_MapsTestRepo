// components/Header.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import Find from "../components/Find";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link href="/" className="header-logo-link">
            <Image
              src="/images/ggc-logo.png"
              alt="GGC Logo"
              width={40}
              height={40}
              priority
            />
            <span className="header-title">GGC Maps</span>
          </Link>
        </div>
        <div className="header-center">
          <Find />
        </div>
        <div className="header-right" aria-hidden="true" />
      </div>
    </header>
  );
}
