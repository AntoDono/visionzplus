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
              <div className="text-purple-400 mb-4 flex items-center justify-center h-16">
                <svg className="w-10 h-10 transform translate-y-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v17a1 1 0 001 1h17v-2H5V3H3z"/>
                  <path d="M15 10v8h2v-8h-2zM7 12v6h2v-6H7zm4-4v10h2V8h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Smart Visualization</h3>
              <p className="text-gray-400">Transform complex data into beautiful, interactive visualizations</p>
            </div>

            {/* AI Predictions */}
            <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="text-purple-400 mb-4 flex items-center justify-center h-16">
                <svg className="w-11 h-11 transform translate-y-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a9 9 0 00-9 9v7.5c0 1.93 1.57 3.5 3.5 3.5h11c1.93 0 3.5-1.57 3.5-3.5V11a9 9 0 00-9-9zm5.5 16.5c0 .83-.67 1.5-1.5 1.5h-8c-.83 0-1.5-.67-1.5-1.5V11c0-3.86 3.14-7 7-7s7 3.14 7 7v7.5z"/>
                  <circle cx="9" cy="10" r="1"/>
                  <circle cx="15" cy="10" r="1"/>
                  <path d="M12 16c1.66 0 3-1.34 3-3H9c0 1.66 1.34 3 3 3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Predictions</h3>
              <p className="text-gray-400">Leverage advanced AI to forecast trends and patterns</p>
            </div>

            {/* Real-time Analytics */}
            <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="text-purple-400 mb-4 flex items-center justify-center h-16">
                <svg className="w-10 h-10 transform translate-y-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2.06v3.88c3.39.49 6 3.39 6 6.91 0 .9-.18 1.75-.5 2.54l3.37 1.84c.5-1.35.77-2.8.77-4.32 0-5.52-3.83-10.13-8.89-11.37zm-2 0C6.04 3.3 2.21 7.91 2.21 13.43c0 1.52.27 2.97.77 4.32l3.37-1.84c-.32-.79-.5-1.64-.5-2.54 0-3.52 2.61-6.42 6-6.91V2.06z"/>
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </div>
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
