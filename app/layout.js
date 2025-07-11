import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LenisProvider from '@/components/lenisprovider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SM Academy',
  description: 'Your trusted source for educational notes and resources',
  icons: {
    icon: '/favicon.ico',         // default favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LenisProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}