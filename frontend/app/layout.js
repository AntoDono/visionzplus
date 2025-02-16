import './globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VisionZ+',
  description: 'Transform your health data into actionable insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} relative min-h-full`}>
        <Header />
        <main>{children}</main>
        <footer className="absolute bottom-0 w-full py-6 text-center text-sm text-gray-500">
          {new Date().getFullYear()} VisionZ+. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
