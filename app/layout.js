// app/layout.js

import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS for styling
import '../app/global.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

// Load the Inter font from Google Fonts with Latin subset
const inter = Inter({ subsets: ['latin'] });

// Metadata for the application
export const metadata = {
  title: 'GGC Maps', // Title of the application
  description: 'Campus map for Georgia Gwinnett College', // Description for SEO
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Render the header at the top of the page */}
        <Header />

        {/* Main container for the layout */}
        <div className="container-fluid">
          <div className="row flex-nowrap">
            {/* Sidebar on the left */}
            <div className="col-auto p-0">
              <Sidebar />
            </div>

            {/* Main content area */}
            <div className="col py-3">
              <main>{children}</main>
            </div>              
          </div>
        </div>

        {/* Render the footer at the bottom of the page */}
        <Footer />
      </body>
    </html>
  );
}