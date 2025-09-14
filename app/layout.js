// app/layout.js

import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css'; // <-- Add this line
import '../app/global.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GGC Maps',
  description: 'Campus map for Georgia Gwinnett College',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="container-fluid">
          <div className="row flex-nowrap">
            <div className="col-auto p-0">
              <Sidebar />
            </div>
            <div className="col py-3">
              <main>{children}</main>
            </div>              
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}