'use client';

import Link from 'next/link';

export function NavigationMenu({ children }) {
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center space-x-4">{children}</ul>
    </nav>
  );
}

export function NavigationMenuItem({ children }) {
  return <li>{children}</li>;
}

export function NavigationMenuLink({ href, children }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
    >
      {children}
    </Link>
  );
}
