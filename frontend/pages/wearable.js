'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GridIllustration from '../components/ui/grid-illustration';
import PulseAnimation from '../components/ui/pulse-animation';

export default function WearablePage() {
    const [email, setEmail] = useState('alexandre.venet@hotmail.com');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [terraUser, setTerraUser] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [healthData, setHealthData] = useState({
        activity: [],
        daily: [],
        sleep: [],
        body: [],
        user_events: []
    });

    // Check if user is already connected and fetch data on page load
    useEffect(() => {
        const checkUserConnection = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/wearable/historical-data/${encodeURIComponent(email)}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setTerraUser({
                        reference_id: email,
                        provider: 'GARMIN'
                    });
                    setHealthData(data.data);
                    setConnectionStatus('Connected with data loaded');
                }
            } catch (error) {
                console.error('Error checking user connection:', error);
                setConnectionStatus('Error loading data: ' + error.message);
            }
        };
        
        checkUserConnection();
    }, [email]);

    // Polling function to check data status
    const pollForData = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/wearable/historical-data/${encodeURIComponent(userId)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            console.log('Polling response:', data);
            
            if (data.success) {
                if (data.data && Object.keys(data.data).length > 0) {
                    console.log('Setting health data:', data.data);
                    setHealthData(data.data);
                    return true;
                }
                // If we have a successful response but no data yet, keep polling
                return false;
            }
            return false;
        } catch (error) {
            console.error('Error polling for data:', error);
            return false;
        }
    };

    const connectDevice = async () => {
        setIsConnecting(true);
        setConnectionStatus(null);
        try {
            const response = await fetch(`http://localhost:5000/api/wearable/auth/garmin?user_id=${encodeURIComponent(email)}`);
            const data = await response.json();
            
            if (data.success && data.widget_url) {
                window.open(data.widget_url, '_blank');
                setConnectionStatus('Waiting for authentication...');
                
                // Poll for connection status
                const checkInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(`http://localhost:5000/api/wearable/historical-data/${encodeURIComponent(email)}`);
                        const statusData = await statusResponse.json();
                        
                        if (statusData.success && statusData.data) {
                            clearInterval(checkInterval);
                            setIsConnecting(false);
                            setConnectionStatus('Connected successfully!');
                            setTerraUser({
                                reference_id: email,
                                provider: 'GARMIN'
                            });
                            // Automatically fetch MongoDB data after successful connection
                            fetchHistoricalData();
                        }
                    } catch (error) {
                        console.error('Error checking connection status:', error);
                    }
                }, 2000);
            } else {
                setConnectionStatus('Failed to generate authentication URL');
            }
        } catch (error) {
            console.error('Error connecting device:', error);
            alert('Error connecting device. Please try again.');
        }
    };

    const fetchHistoricalData = async () => {
        setConnectionStatus('Fetching MongoDB data...');
        try {
            const response = await fetch(`http://localhost:5000/api/wearable/historical-data/${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch MongoDB data');
            }

            const data = await response.json();
            if (data.success) {
                setHealthData(data.data);
                setConnectionStatus('Data retrieved successfully!');
            } else {
                setConnectionStatus('Failed to fetch MongoDB data');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setConnectionStatus('Error: ' + error.message);
        }
    };

    return (
        <>
            <div className="fixed inset-0 -z-10">
                <GridIllustration />
            </div>
            
            <div className="relative pt-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="relative py-8 lg:py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="max-w-2xl"
                        >
                            <div className="absolute -left-4 top-8 h-12 w-12">
                                <PulseAnimation delay={0} />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                Connect Your
                                <br />
                                <span className="text-purple-400">Wearable Device</span>
                            </h1>
                            <p className="mt-4 text-lg leading-7 text-gray-600">
                                Connect your device to start tracking your health metrics.
                            </p>

                            <div className="mt-8">
                                <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="mb-4">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={connectDevice}
                                        disabled={isConnecting}
                                        className="w-full rounded-lg bg-purple-400 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {isConnecting ? 'Connecting...' : 'Connect Device'}
                                    </motion.button>

                                    {connectionStatus && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-4 text-sm text-gray-600"
                                        >
                                            {connectionStatus}
                                        </motion.p>
                                    )}
                                </div>

                                {terraUser && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <div className="grid gap-4">
                                            {Object.entries(healthData).map(([key, value]) => (
                                                <motion.div
                                                    key={key}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="card p-4 bg-white rounded-xl shadow-sm border border-gray-200"
                                                    onClick={() => setActiveTab(key)}
                                                >
                                                    <h3 className="text-lg font-semibold capitalize text-gray-900">{key.replace('_', ' ')}</h3>
                                                    <p className="text-sm text-gray-600">{Array.isArray(value) ? `${value.length} records` : '0 records'}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
