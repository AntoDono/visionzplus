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
            try {
                const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setTerraUser({
                        reference_id: email,
                        provider: 'GARMIN'
                    });
                    setHealthData(data.data);
                }
            } catch (error) {
                console.error('Error checking user connection:', error);
            }
        };
        
        checkUserConnection();
    }, [email]);

    // Polling function to check data status
    const pollForData = async (userId) => {
        try {
            const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(userId)}`);
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
        setIsFetching(true);
        setConnectionStatus('Requesting historical data...');
        try {
            // First, request the historical data
            const requestResponse = await fetch('/api/wearable/historical-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: email,
                    days: parseInt(days)
                })
            });
            
            if (!requestResponse.ok) {
                throw new Error('Failed to request historical data');
            }

            const data = await requestResponse.json();
            console.log('Historical data request response:', data);
            if (data.success) {
                setConnectionStatus('Data request initiated, waiting for data...');
                
                // Start polling for data
                let attempts = 0;
                const maxAttempts = 30; // 30 attempts (90 seconds)
                console.log('Starting polling for data...');
                const pollInterval = setInterval(async () => {
                    attempts++;
                    const hasData = await pollForData(email);
                    
                    if (hasData || attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setIsFetching(false);
                        if (!hasData) {
                            setConnectionStatus('Data fetch timeout. Please try again.');
                        } else if (hasData) {
                            setConnectionStatus('Data retrieved successfully!');
                        }
                    }
                }, 3000);
            } else {
                setIsFetching(false);
                setConnectionStatus('Failed to request historical data');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            alert('Error fetching historical data. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-gray-900">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Wearable Data Dashboard</h1>
            
            {/* Device Connection Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {connectionStatus && (
                    <div className={`mb-4 p-3 rounded ${connectionStatus.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {connectionStatus}
                    </div>
                )}
                {terraUser && (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
                        Connected to {terraUser.provider} as {terraUser.reference_id}
                    </div>
                )}
                <h2 className="text-xl font-semibold mb-4">Connect Your Device</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={connectDevice}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Connecting...' : 'Connect Garmin Device'}
                </button>
            </div>

            {/* Historical Data Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Historical Data</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Days of History
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        min="1"
                        max="180"
                    />
                </div>
                <button
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 font-medium shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={fetchHistoricalData}
                    disabled={isFetching || !terraUser}
                >
                    {isFetching ? 'Fetching Data...' : 'Fetch Historical Data'}
                </button>

                {/* Data Display Tabs */}
                <div className="mt-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['activity', 'daily', 'sleep', 'body'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`
                                        py-2 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>
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
                                                            <p><span className="font-medium">Duration:</span> {Math.round(item.duration_s / 60)} minutes</p>
                                                            <p><span className="font-medium">Distance:</span> {(item.distance_meters / 1000).toFixed(2)} km</p>
                                                            <p><span className="font-medium">Calories:</span> {item.calories} kcal</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Steps:</span> {item.steps}</p>
                                                            <p><span className="font-medium">Avg HR:</span> {item.avg_heart_rate_bpm} bpm</p>
                                                            <p><span className="font-medium">Activity Type:</span> {item.activity_type}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'daily' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Summary for {new Date(item.date).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Steps:</span> {item.steps}</p>
                                                            <p><span className="font-medium">Distance:</span> {(item.distance_meters / 1000).toFixed(2)} km</p>
                                                            <p><span className="font-medium">Calories:</span> {item.calories} kcal</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Active Seconds:</span> {Math.round(item.active_seconds / 60)} minutes</p>
                                                            <p><span className="font-medium">Resting HR:</span> {item.resting_heartrate} bpm</p>
                                                            <p><span className="font-medium">Floors Climbed:</span> {item.floors_climbed || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'sleep' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Sleep on {new Date(item.metadata?.start_time).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Duration:</span> {Math.round(item.duration_s / 3600)} hours</p>
                                                            <p><span className="font-medium">Deep Sleep:</span> {Math.round(item.deep_sleep_s / 60)} minutes</p>
                                                            <p><span className="font-medium">Light Sleep:</span> {Math.round(item.light_sleep_s / 60)} minutes</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">REM Sleep:</span> {Math.round(item.rem_sleep_s / 60)} minutes</p>
                                                            <p><span className="font-medium">Sleep Score:</span> {item.sleep_score || 'N/A'}</p>
                                                            <p><span className="font-medium">Times Awake:</span> {item.times_woken || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'body' && (
                                                <div>
                                                    <h3 className="font-medium mb-2">Body Metrics on {new Date(item.timestamp).toLocaleDateString()}</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p><span className="font-medium">Weight:</span> {item.weight_kg?.toFixed(1)} kg</p>
                                                            <p><span className="font-medium">BMI:</span> {item.bmi?.toFixed(1) || 'N/A'}</p>
                                                            <p><span className="font-medium">Body Fat:</span> {item.body_fat_pct?.toFixed(1)}%</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Muscle Mass:</span> {item.muscle_mass_kg?.toFixed(1)} kg</p>
                                                            <p><span className="font-medium">Bone Mass:</span> {item.bone_mass_kg?.toFixed(1)} kg</p>
                                                            <p><span className="font-medium">Water %:</span> {item.water_pct?.toFixed(1)}%</p>
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
