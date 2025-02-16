import '../app/globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VisionZ+',
  description: 'Transform your health data into actionable insights',
};

export default function App({ Component, pageProps }) {
  return (
    <div className="h-full w-screen">
      <Header />
      <div className="h-fit w-full pt-12">
        <Component {...pageProps} />
      </div>
      <footer className="absolute bottom-0 w-full py-6 text-center text-sm text-gray-500">
        {new Date().getFullYear()} VisionZ+. All rights reserved.
      </footer>
    </div>
  );
}
