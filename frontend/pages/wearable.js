'use client';

import { useState, useEffect } from 'react';

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
                const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
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
            const response = await fetch(`/api/wearable/historical-data/${encodeURIComponent(email)}`);
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

    const downloadHistoricalData = () => {
        // Create a Blob with the JSON data
        const jsonString = JSON.stringify(healthData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'historical-data.json';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Historical Data</h2>
                    <button
                        onClick={downloadHistoricalData}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-medium shadow-sm"
                        disabled={!healthData || Object.keys(healthData).every(key => healthData[key].length === 0)}
                    >
                        Download Data
                    </button>
                </div>

                {/* Data Display Dropdowns */}
                <div className="mt-6 space-y-4">
                    {Object.entries(healthData).map(([collection, documents]) => (
                        <div key={collection} className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <button
                                onClick={() => setActiveTab(activeTab === collection ? null : collection)}
                                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
                            >
                                <span className="font-medium text-gray-900">{collection} ({documents.length} documents)</span>
                                <svg
                                    className={`w-5 h-5 transform transition-transform ${activeTab === collection ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {activeTab === collection && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="max-h-96 overflow-auto">
                                        {documents.map((doc, index) => (
                                            <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                                    {JSON.stringify(doc, null, 2)}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
