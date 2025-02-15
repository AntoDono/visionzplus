'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import "../app/globals.css";
import Image from 'next/image';
import Link from 'next/link';
import OpenAI from "openai";
import { config } from '../utils/config';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  dangerouslyAllowBrowser: true // Only if you need to use OpenAI in the browser
});

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-white rounded-full"
            animate={{
              y: ["0%", "-100%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function Result() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('data');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      console.log('Data from session storage:', parsedData);

      // Make API call
      fetch('http://localhost:3000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ files: parsedData })
      })
      .then(response => {
        if (response.status === 200) {
          setIsLoading(false);
        } else {
          throw new Error('API call failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Optionally handle error state here
      });
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 pt-32">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Results</h1>
          <p className="text-gray-300">
            {data ? `Analyzing ${data.length} file${data.length !== 1 ? 's' : ''}` : 'No data available'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
