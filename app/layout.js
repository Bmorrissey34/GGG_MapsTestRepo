// app/layout.js

import { Inter } from 'next/font/google';
import '../app/global.css'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

// This is your original font setup
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GGC Maps',
  description: 'Campus map for Georgia Gwinnett College',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* This correctly applies the font className to the body tag, 
        just like in your original file.
      */}
      <body className={inter.className}>
        <Header />
        {/* It's a good practice to wrap the main page content in a <main> tag */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}