'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import GridIllustration from '../components/ui/grid-illustration';
import FeatureItem from '../components/feature-item';
import PulseAnimation from '../components/ui/pulse-animation';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <GridIllustration />
      </div>
      
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative py-8 lg:py-12">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
              {/* Left side: Text content */}
              <div className="lg:col-span-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="relative"
                >
                  <div className="absolute -left-4 top-8 h-12 w-12">
                    <PulseAnimation delay={0} />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                    Transform Your Health
                    <br />
                    Data Into
                    <br />
                    <span className="text-purple-400">Actionable Insights</span>
                  </h1>
                  <p className="mt-4 text-lg leading-7 text-gray-600">
                    Connect your wearable devices and unlock powerful analytics to understand 
                    your health patterns and make informed decisions about your well-being.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/wearable"
                      className="inline-flex items-center rounded-lg bg-purple-400 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    >
                      Connect Device
                    </Link>
                    <Link
                      href="/analyze"
                      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View Analytics
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Right side: Feature items */}
              <div className="mt-12 lg:col-span-6 lg:mt-0">
                <div className="flex flex-col gap-3">
                  <FeatureItem
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title="Real-Time Sync"
                    description="Seamlessly connect and sync data from your wearable devices for instant access to your health metrics."
                    delay={0.2}
                  />
                  <FeatureItem
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                    title="AI Analytics"
                    description="Leverage AI-powered analytics to uncover patterns and trends in your health data."
                    delay={0.4}
                  />
                  <FeatureItem
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    title="Secure & Private"
                    description="Your health data is encrypted and protected with enterprise-grade security measures."
                    delay={0.6}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}