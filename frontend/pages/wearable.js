'use client';

import { useState, useEffect } from 'react';

export default function WearablePage() {
    const [email, setEmail] = useState('alexandre.venet@hotmail.com');
    const [days, setDays] = useState(28);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [terraUser, setTerraUser] = useState(null);
    const [healthData, setHealthData] = useState({
        activity: [],
        daily: [],
        sleep: [],
        body: []
    });
    const [activeTab, setActiveTab] = useState('activity');

    // Check if user is already connected on page load
    useEffect(() => {
        const checkUserConnection = async () => {
            if (!email) return;
            
            try {
                const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    console.log('User not connected:', errorData);
                    return;
                }
                
                const data = await response.json();
                if (data.success && data.hasData) {
                    console.log('Found existing data:', data);
                    setTerraUser({
                        reference_id: email,
                        provider: 'GARMIN'
                    });
                    setHealthData(data.data);
                    setConnectionStatus('Connected');
                }
            } catch (error) {
                console.error('Error checking user connection:', error);
            }
        };
        
        checkUserConnection();
    }, [email]);

    // Polling function to check data status
    const pollForData = async (referenceId) => {
        try {
            const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(referenceId)}`);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error polling data:', errorData);
                throw new Error(errorData.error || 'Failed to fetch data');
            }
            
            const data = await response.json();
            console.log('Polling response for', referenceId, ':', data);
            
            if (data.success) {
                if (data.hasData) {
                    console.log('Setting health data for', referenceId, ':', data.data);
                    setHealthData(prevData => ({
                        ...prevData,
                        ...data.data
                    }));
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
            const response = await fetch(`/api/wearable/auth/garmin?user_id=${encodeURIComponent(email)}`);
            const data = await response.json();
            
            if (data.success && data.widget_url) {
                window.open(data.widget_url, '_blank');
                setConnectionStatus('Waiting for authentication...');
                
                // Poll for connection status
                const checkInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
                        const statusData = await statusResponse.json();
                        
                        if (statusData.success && statusData.data) {
                            clearInterval(checkInterval);
                            setIsConnecting(false);
                            setConnectionStatus('Connected successfully!');
                            setTerraUser({
                                reference_id: email,
                                provider: 'GARMIN'
                            });
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
        if (!email) {
            alert('Please enter an email address');
            return;
        }

        setIsFetching(true);
        setConnectionStatus(`Requesting historical data for ${email}...`);

        try {
            // First try to get existing data
            const existingDataResponse = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
            const existingData = await existingDataResponse.json();

            if (existingData.success && existingData.hasData) {
                console.log('Found existing data:', existingData);
                setHealthData(existingData.data);
                setConnectionStatus('Found existing data');
                setIsFetching(false);
                return;
            }

            // If no existing data, request new data
            const requestResponse = await fetch('/api/wearable/historical-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    referenceId: email
                })
            });

            if (!requestResponse.ok) {
                const errorData = await requestResponse.json();
                console.error('Error requesting data:', errorData);
                setConnectionStatus(`Error: ${errorData.error || 'Failed to request data'}`);
                setIsFetching(false);
                return;
            }

            const data = await requestResponse.json();
            if (!data.success) {
                setConnectionStatus('Failed to initiate data request');
                setIsFetching(false);
                return;
            }

            setConnectionStatus('Data request initiated. Waiting for data...');

            // Poll for data
            let attempts = 0;
            const maxAttempts = 30; // 1 minute with 2-second intervals

            while (attempts < maxAttempts) {
                const pollResponse = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
                const pollData = await pollResponse.json();

                if (pollData.success && pollData.hasData) {
                    setHealthData(pollData.data);
                    setConnectionStatus('Data retrieved successfully');
                    setIsFetching(false);
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            }

            setConnectionStatus('Timed out waiting for data');
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setConnectionStatus(`Error: ${error.message || 'Failed to fetch data'}`);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-gray-900">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Wearable Data Dashboard</h1>
            
            {/* Device Connection Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Device Connection</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={connectDevice}
                        disabled={isConnecting || !email}
                        className={`px-4 py-2 rounded-md text-white ${
                            isConnecting || !email
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Device'}
                    </button>
                    <button
                        onClick={fetchHistoricalData}
                        disabled={isFetching || !email}
                        className={`px-4 py-2 rounded-md text-white ${
                            isFetching || !email
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {isFetching ? 'Fetching...' : 'Fetch Historical Data'}
                    </button>
                </div>
                {connectionStatus && (
                    <p className="mt-4 text-sm text-gray-600">{connectionStatus}</p>
                )}
            </div>

            {/* Data Display Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Health Data</h2>
                
                {/* Tabs */}
                <div className="mt-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['activity', 'daily', 'sleep', 'body'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${
                                        activeTab === tab
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Data Display */}
                    <div className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-gray-900">
                            {healthData[activeTab]?.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData[activeTab].map((item, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                            {activeTab === 'activity' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Activity on {new Date(item.metadata?.start_time).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Distance:</span> {item.distance_meters} meters</p>
                                                            <p><span className="font-medium">Duration:</span> {item.duration_seconds} seconds</p>
                                                            <p><span className="font-medium">Steps:</span> {item.steps}</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Calories:</span> {item.calories}</p>
                                                            <p><span className="font-medium">Heart Rate:</span> {item.avg_heart_rate_bpm} bpm</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'daily' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Daily Summary for {new Date(item.metadata?.start_time).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Steps:</span> {item.steps}</p>
                                                            <p><span className="font-medium">Distance:</span> {item.distance_meters} meters</p>
                                                            <p><span className="font-medium">Calories:</span> {item.calories}</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Active Seconds:</span> {item.active_seconds}</p>
                                                            <p><span className="font-medium">Low Activity Seconds:</span> {item.low_activity_seconds}</p>
                                                            <p><span className="font-medium">Rest Seconds:</span> {item.rest_seconds}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'sleep' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Sleep on {new Date(item.metadata?.start_time).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Duration:</span> {item.duration_seconds} seconds</p>
                                                            <p><span className="font-medium">Light Sleep:</span> {item.light_sleep_seconds} seconds</p>
                                                            <p><span className="font-medium">Deep Sleep:</span> {item.deep_sleep_seconds} seconds</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">REM Sleep:</span> {item.rem_sleep_seconds} seconds</p>
                                                            <p><span className="font-medium">Awake:</span> {item.awake_seconds} seconds</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'body' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Body Metrics on {new Date(item.metadata?.start_time).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Weight:</span> {item.weight_kg} kg</p>
                                                            <p><span className="font-medium">BMI:</span> {item.bmi}</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Body Fat:</span> {item.body_fat_percentage}%</p>
                                                            <p><span className="font-medium">Lean Mass:</span> {item.lean_mass_kg} kg</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No {activeTab} data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
