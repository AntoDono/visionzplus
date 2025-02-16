'use client';

import { motion } from 'framer-motion';
import PulseAnimation from './ui/pulse-animation';

export default function FeatureItem({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      className="group relative flex flex-col rounded-xl border-[1.5px] border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-lg"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 1,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/10 shadow-sm transition-transform duration-500 group-hover:scale-110">
          <div className="text-purple-400 transition-colors duration-500 group-hover:text-purple-500">
            {icon}
          </div>
          <PulseAnimation className="left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2" delay={delay} />
        </div>
        <h3 className="text-base font-medium text-gray-900 transition-colors duration-500 group-hover:text-purple-400">
          {title}
        </h3>
      </div>
      <p className="mt-2 pl-[52px] text-sm leading-6 text-gray-500 transition-colors duration-500 group-hover:text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}
