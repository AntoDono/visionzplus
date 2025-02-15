'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-32">
      <div className="container mx-auto px-4 py-16">

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur"></div>
            <h1 className="relative text-5xl md:text-7xl font-bold mb-6 text-white">
              VisionZ<span className="text-purple-400">+</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl p-10"
          >
            Visualize, Create, and Predict Any Data with AI-Powered Insights
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex gap-4"
          >
            <Link 
              href="/analyze"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
            >
              Start Analyzing
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Data Visualization */}
            <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="text-purple-400 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Smart Visualization</h3>
              <p className="text-gray-400">Transform complex data into beautiful, interactive visualizations</p>
            </div>

            {/* AI Predictions */}
            <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="text-purple-400 text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Predictions</h3>
              <p className="text-gray-400">Leverage advanced AI to forecast trends and patterns</p>
            </div>

            {/* Real-time Analytics */}
            <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="text-purple-400 text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-time Analytics</h3>
              <p className="text-gray-400">Process and analyze data in real-time for instant insights</p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">99%</div>
              <div className="text-gray-400">Accuracy Rate</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Chart Types</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">10x</div>
              <div className="text-gray-400">Faster Analysis</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Real-time Updates</div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
