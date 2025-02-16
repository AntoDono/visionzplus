'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './button';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const MobileNavItem = ({ href, children }) => (
    <li>
      <Link
        href={href}
        className="block rounded-md py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
        onClick={() => setIsOpen(false)}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute left-4 right-4 top-20 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
          <nav className="flex flex-col space-y-1">
            <MobileNavItem href="/">Home</MobileNavItem>
            <MobileNavItem href="/analyze">Analyze</MobileNavItem>
            <MobileNavItem href="/wearable">Wearables</MobileNavItem>
          </nav>
        </div>
      )}
    </div>
  );
}
