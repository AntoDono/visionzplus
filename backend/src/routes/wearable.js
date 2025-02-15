import express from 'express';
import UserWearable from '../models/UserWearable.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Terra client with REST API
const TERRA_API_KEY = process.env.TERRA_API_KEY;
const TERRA_DEV_ID = process.env.TERRA_DEV_ID;
const TERRA_API_URL = 'https://api.tryterra.co/v2';

// Helper function to make authenticated Terra API calls
async function callTerraAPI(endpoint, method = 'GET', body = null, params = null) {
  console.log(`Making Terra API call to ${endpoint}`);
  console.log('Terra credentials:', {
    'dev-id': TERRA_DEV_ID,
    'api-key-preview': TERRA_API_KEY ? TERRA_API_KEY.substring(0, 5) + '...' : 'missing'
  });
  
  const headers = {
    'dev-id': TERRA_DEV_ID,
    'x-api-key': TERRA_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log('Request body:', JSON.stringify(body, null, 2));
  }

  try {
    let url = `${TERRA_API_URL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    console.log(`Fetching ${url}`);
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    
    const textResponse = await response.text();
    
    try {
      const data = JSON.parse(textResponse);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (response.status >= 400) {
        throw new Error(`Terra API error: ${data.message || JSON.stringify(data)}`);
      }
      
      return data;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Raw response:', textResponse);
      throw new Error(`Invalid JSON response: ${textResponse.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('Terra API call failed:', error);
    throw error;
  }
}

// Get authentication URL for device connection
router.get('/auth/garmin', async (req, res) => {
  try {
    const reference_id = req.query.user_id || 'alexandre.venet@hotmail.com';
    
    // Generate authentication URL using Terra API
    const response = await callTerraAPI('/auth/generateWidgetSession', 'POST', {
      providers: "GARMIN",
      language: "en",
      reference_id: reference_id,
      auth_success_redirect_url: `http://localhost:${process.env.PORT || 5001}/api/wearable/callback`,
      auth_failure_redirect_url: `http://localhost:${process.env.PORT || 5001}/api/wearable/callback/error`
    });
    
    res.json({
      success: true,
      widget_url: response.url,
      session_id: response.session_id,
      expires_in: response.expires_in,
      reference_id: reference_id
    });
  } catch (error) {
    console.error('Auth URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate auth URL',
      details: error.message
    });
  }
});

// Callback endpoint for Terra authentication
router.get('/callback', async (req, res) => {
  const frontendUrl = 'http://localhost:3000/wearable';
  try {
    const { user_id, reference_id, resource } = req.query;
    console.log('Terra callback received:', req.query);
    
    // If we have a user_id, it means authentication was successful
    if (user_id) {
      // Store or update user wearable data
      await UserWearable.findOneAndUpdate(
        { referenceId: reference_id },
        {
          terraUserId: user_id,
          provider: resource,
          lastSync: new Date()
        },
        { upsert: true }
      );

      // Redirect back to frontend
      res.redirect(frontendUrl);
    } else {
      // Authentication failed
      res.status(400).json({
        error: 'Authentication failed',
        details: req.query
      });
    }
  } catch (error) {
    console.error('Terra callback error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// Helper function to process health data
const processHealthData = async (user, event, terraReference) => {
  const dataArray = Array.isArray(event.data) ? event.data : [event.data];
  const updates = new Map();

  for (const item of dataArray) {
    const key = event.type === 'activity' || event.type === 'sleep'
      ? item.metadata?.summary_id
      : item.metadata?.start_time;

    if (key) {
      updates.set(key, item);
    }
  }

  // Get current data map
  const currentData = user.healthData[event.type] || new Map();
  
  // Merge new data
  for (const [key, value] of updates) {
    currentData.set(key, value);
  }

  return currentData;
};

// Webhook endpoint for Terra events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const terraReference = req.headers['terra-reference'];
    const terraSignature = req.headers['terra-signature'];
    console.log('Received Terra webhook event:', event);
    console.log('Terra reference:', terraReference);

    if (event.type === 'auth' && event.status === 'success') {
      // Handle authentication success
      await UserWearable.findOneAndUpdate(
        { referenceId: event.reference_id },
        {
          terraUserId: event.user.user_id,
          provider: event.user.provider,
          lastSync: new Date(),
          scopes: event.user.scopes,
          referenceId: event.reference_id,
          'healthData.activity': new Map(),
          'healthData.daily': new Map(),
          'healthData.sleep': new Map(),
          'healthData.body': new Map()
        },
        { upsert: true }
      );

      // Automatically request last 28 days of data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      // Request historical data from all endpoints
      const endpoints = ['activity', 'daily', 'sleep', 'body'];
      for (const endpoint of endpoints) {
        await callTerraAPI(`/${endpoint}`, 'GET', null, {
          user_id: event.user.user_id,
          start_date: start,
          end_date: end,
          to_webhook: true
        });
      }
    } else if (event.type === 'large_request_processing') {
      console.log('Large request processing:', event);
      // Update user record to indicate processing has started
      await UserWearable.findOneAndUpdate(
        { terraUserId: event.user.user_id },
        { 
          $set: { 
            'pendingRequests.status': 'processing'
          }
        }
      );
      console.log('Updated processing status for user:', event.user.user_id);
    } else if (event.type === 'large_request_sending') {
      console.log('Large request sending, expecting chunks:', event.number_of_payloads);
      // Update user record with total expected chunks
      await UserWearable.findOneAndUpdate(
        { terraUserId: event.user.user_id },
        { 
          $set: { 
            'pendingRequests.totalChunks': event.number_of_payloads,
            'pendingRequests.status': 'receiving'
          }
        }
      );
      console.log('Updated chunks info for user:', event.user.user_id);
    } else if (event.type === 'activity' || event.type === 'daily' || event.type === 'sleep' || event.type === 'body') {
      console.log(`Received ${event.type} data for user:`, event.user.user_id);
      console.log('Reference ID:', event.reference_id);
      
      const user = await UserWearable.findOne({ terraUserId: event.user.user_id });
      if (user) {
        // Process and deduplicate the new data
        const updatedData = await processHealthData(user, event, terraReference);
        
        // Update the user record with the processed data
        const update = {
          $set: {
            [`healthData.${event.type}`]: updatedData,
            lastSync: new Date()
          },
          $inc: { 'pendingRequests.chunksReceived': 1 }
        };

        console.log(`Updating ${event.type} data for user:`, update);
        
        const updatedUser = await UserWearable.findOneAndUpdate(
          { terraUserId: event.user.user_id },
          update,
          { new: true }
        );

        // Check if all chunks have been received
        if (updatedUser.pendingRequests?.chunksReceived === updatedUser.pendingRequests?.totalChunks) {
          console.log('All chunks received, clearing pending requests');
          await UserWearable.findOneAndUpdate(
            { terraUserId: event.user.user_id },
            { 
              $set: { 
                'pendingRequests.status': 'completed',
                lastSync: new Date()
              }
            }
          );
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Terra webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      details: error.message
    });
  }
});

// Request historical data for a user
router.post('/historical-data', async (req, res) => {
  console.log('Received historical data request:', req.body);
  try {
    const { referenceId } = req.body;
    if (!referenceId) {
      return res.status(400).json({ error: 'referenceId (email) is required' });
    }

    const user = await UserWearable.findOne({ referenceId });
    if (!user || !user.terraUserId) {
      return res.status(404).json({ error: 'User not found or not connected to Terra' });
    }

    console.log('Found user:', user);

    // Use fixed 28 days for historical data
    const days = 28;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    // Format dates as YYYY-MM-DD
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Generate a unique reference for this batch of requests
    const batchReference = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the request details in the user record
    await UserWearable.findOneAndUpdate(
      { referenceId },
      { 
        $set: { 
          pendingRequests: {
            reference: batchReference,
            endpoints: ['activity', 'daily', 'sleep', 'body'],
            startDate: start,
            endDate: end,
            requestedAt: new Date(),
            status: 'initiated',
            chunksReceived: 0,
            totalChunks: null
          }
        }
      }
    );

    // Make requests to Terra API for each data type
    console.log('Making Terra API requests for user:', user.terraUserId);
    const requestPromises = ['activity', 'daily', 'sleep', 'body'].map(async (dataType) => {
      try {
        console.log('Making Terra API request with terraUserId:', user.terraUserId);
        const response = await callTerraAPI(`/${dataType}`, 'GET', null, {
          user_id: user.terraUserId,
          start_date: start,
          end_date: end,
          to_webhook: true
        });
        console.log(`Requested ${dataType} data from Terra:`, response);
        return { dataType, success: true };
      } catch (error) {
        console.error(`Error requesting ${dataType} data:`, error);
        return { dataType, success: false, error: error.message };
      }
    });

    // Wait for all requests to be initiated
    const results = await Promise.all(requestPromises);
    const failedRequests = results.filter(r => !r.success);

    if (failedRequests.length > 0) {
      console.warn('Some data type requests failed:', failedRequests);
    }

    // Return success response with the reference
    res.json({
      success: true,
      message: 'Historical data request initiated',
      reference: batchReference,
      failedDataTypes: failedRequests.map(r => r.dataType)
    });

  } catch (error) {
    console.error('Historical data request error:', error);
    res.status(500).json({
      error: 'Failed to request historical data',
      details: error.message
    });
  }
});

// Get user's stored historical data
router.get('/historical-data/:referenceId', async (req, res) => {
  const { referenceId } = req.params;
  console.log('Fetching stored historical data for:', referenceId);

  try {
    const user = await UserWearable.findOne({ referenceId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert Maps to arrays for response
    const healthData = {
      activity: Array.from(user.healthData?.activity?.values() || []),
      daily: Array.from(user.healthData?.daily?.values() || []),
      sleep: Array.from(user.healthData?.sleep?.values() || []),
      body: Array.from(user.healthData?.body?.values() || [])
    };

    const hasData = Object.values(healthData).some(arr => arr.length > 0);
    console.log('Found health data:', {
      activityCount: healthData.activity.length,
      dailyCount: healthData.daily.length,
      sleepCount: healthData.sleep.length,
      bodyCount: healthData.body.length,
      hasData
    });

    return res.json({
      success: true,
      data: healthData,
      hasData,
      user: {
        terraUserId: user.terraUserId,
        provider: user.provider,
        lastSync: user.lastSync
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get user's wearable data
router.get('/data/:referenceId', async (req, res) => {
  try {
    const userWearable = await UserWearable.findOne({ referenceId: req.params.referenceId });
    if (!userWearable) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        provider: userWearable.provider,
        lastSync: userWearable.lastSync,
        healthData: userWearable.healthData
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
});

// Test route for Terra connection
router.get('/test/connection', async (req, res) => {
  try {
    console.log('Testing Terra API connection...');
    console.log('Environment check:', {
      TERRA_API_KEY: TERRA_API_KEY ? 'Present' : 'Missing',
      TERRA_DEV_ID: TERRA_DEV_ID ? 'Present' : 'Missing'
    });

    const response = await callTerraAPI('/subscriptions', 'GET');
    res.json({
      success: true,
      message: 'Successfully connected to Terra API',
      data: response
    });
  } catch (error) {
    console.error('Terra connection test failed:', error);
    res.status(500).json({
      error: 'Failed to connect to Terra API',
      details: error.message
    });
  }
});

export default router;
