'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu';
import MobileMenu from './ui/mobile-menu';

const NavLink = ({ href, children }) => {
  return (
    <motion.div
      className="relative"
      whileHover="hover"
      initial="initial"
      variants={{
        initial: { scale: 1 },
        hover: { scale: 1.05 }
      }}
      transition={{ duration: 0.4 }}
    >
      <Link 
        href={href} 
        className="relative px-4 py-2 text-sm text-gray-900 transition-colors hover:text-gray-900"
      >
        {children}
        <motion.div
          className="absolute inset-x-0 -bottom-px h-px bg-purple-400/20"
          variants={{
            initial: { scaleX: 0, opacity: 0 },
            hover: { 
              scaleX: 1, 
              opacity: 1,
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 25
              }
            }
          }}
        />
      </Link>
    </motion.div>
  );
};

export default function Header() {
  return (
    <header className="relative p-5">
      <div className="mx-auto max-w-5xl">
        <nav
          className="rounded-xl border border-gray-200 bg-white/95 px-7 py-2 backdrop-blur-sm"
          aria-label="Main navigation"
        >
          <div className="flex h-10 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
                  <Image
                    src="/logo.png"
                    alt="VisionZ+ Logo"
                    width={70}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold text-gray-900"
              >
                VisionZ<span className="text-purple-400">+</span>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-4">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/analyze">Analyze</NavLink>
              <NavLink href="/wearable">Wearables</NavLink>
            </div>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
