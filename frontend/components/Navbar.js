'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <nav className="container p-4 bg-transparent fixed top-0 left-0">
      <div className="flex items-center gap-4">
        <Link href="/">
          <div className="w-fit cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="VisionZ+ Logo"
              width={100}
              height={35}
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          VisionZ<span className="text-purple-400">+</span>
        </motion.div>
      </div>
    </nav>
  );
}
