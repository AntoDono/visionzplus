import express from 'express';
import UserWearable from '../models/UserWearable.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        { userId: reference_id },
        {
          terraUserId: user_id,
          provider: resource,
          lastSync: new Date()
        },
        { upsert: true }
      );

      // Redirect to success page or show success message
      // res.json({
      //   success: true,
      //   message: 'Authentication successful',
      //   user_id,
      //   reference_id,
      //   provider: resource
      // });
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

// Webhook endpoint for Terra events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const terraReference = req.headers['terra-reference'];
    console.log('Received Terra webhook event:', event);
    console.log('Terra reference:', terraReference);

    if (event.type === 'auth' && event.status === 'success') {
      // Handle authentication success
      await UserWearable.findOneAndUpdate(
        { userId: event.reference_id },
        {
          terraUserId: event.user.user_id,
          provider: event.user.provider,
          lastSync: new Date(),
          scopes: event.user.scopes
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
    } else if (event.type === 'large_request_sending') {
      console.log('Large request sending, expecting chunks:', event.number_of_payloads);
    } else if (event.type === 'activity' || event.type === 'daily' || event.type === 'sleep' || event.type === 'body') {
      // Store the data chunk
      const user = await UserWearable.findOne({ terraUserId: event.user.user_id });
      if (user) {
        // Add the data to the appropriate array in healthData
        await UserWearable.findOneAndUpdate(
          { terraUserId: event.user.user_id },
          { 
            $push: { [`healthData.${event.type}`]: event.data },
            lastSync: new Date()
          }
        );
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
    const { userId, days = 28 } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find or create the user's Terra record
    let userWearable = await UserWearable.findOne({ userId });
    
    // If user doesn't exist, try to get their data from Terra
    if (!userWearable) {
      try {
        // Get user data from Terra
        const userResponse = await callTerraAPI('/userinfo', 'GET', null, {
          user_id: userId
        });

        if (userResponse && userResponse.user) {
          userWearable = await UserWearable.create({
            userId,
            terraUserId: userResponse.user.user_id,
            provider: userResponse.user.provider,
            scopes: userResponse.user.scopes
          });
        } else {
          return res.status(404).json({ error: 'User not found in Terra' });
        }
      } catch (error) {
        console.error('Error getting user info from Terra:', error);
        return res.status(500).json({ error: 'Failed to get user info from Terra' });
      }
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    // Format dates as YYYY-MM-DD
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Endpoints to fetch data from
    const endpoints = ['activity', 'daily', 'sleep', 'body'];
    const requests = endpoints.map(endpoint => 
      callTerraAPI(`/${endpoint}`, 'GET', null, {
        user_id: userWearable.terraUserId,
        start_date: start,
        end_date: end,
        to_webhook: true
      })
    );

    // Generate a unique reference for this request
    const terraReference = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await UserWearable.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          pendingDataRequests: {
            reference: terraReference,
            requestedAt: new Date(),
            endpoints
          }
        }
      }
    );

    // Wait for all requests to be initiated
    await Promise.all(requests);

    res.json({
      success: true,
      message: 'Historical data request initiated',
      terraReference,
      endpoints
    });
  } catch (error) {
    console.error('Historical data request error:', error);
    res.status(500).json({
      error: 'Failed to request historical data',
      details: error.message
    });
  }
});

// Get historical data from MongoDB
router.get('/historical-data/:userId', async (req, res) => {
  console.log('Fetching historical data from MongoDB');
  try {
    // Read the exported data directly from the known path using relative path
    const exportPath = path.join(__dirname, '../../../exports/mongodb_export.json');
    try {
      const mongoData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
      res.json({
        success: true,
        data: mongoData
      });
    } catch (error) {
      console.error('Error reading MongoDB export:', error);
      res.status(500).json({
        error: 'Failed to read MongoDB data',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      details: error.message
    });
  }
});

// Get user's wearable data
router.get('/data/:userId', async (req, res) => {
  try {
    const userWearable = await UserWearable.findOne({ userId: req.params.userId });
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
      TERRA_API_URL,
      'TERRA_DEV_ID exists': !!TERRA_DEV_ID,
      'TERRA_API_KEY exists': !!TERRA_API_KEY
    });
    
    // Test Terra API connection by generating a widget session
    const widgetSession = await callTerraAPI('/auth/generateWidgetSession', 'POST', {
      providers: "GARMIN",
      language: "en",
      reference_id: "alexandre.venet@hotmail.com",
      auth_success_redirect_url: `http://localhost:${process.env.PORT || 5001}/api/wearable/callback`,
      auth_failure_redirect_url: `http://localhost:${process.env.PORT || 5001}/api/wearable/callback/error`
    });
    
    // No longer using session for this test endpoint

    console.log('Test connection successful');
    res.json({
      success: true,
      terra_connection: 'OK',
      widget_session: widgetSession
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      error: 'Connection test failed',
      details: error.message,
      terra_dev_id_exists: !!TERRA_DEV_ID,
      terra_api_key_exists: !!TERRA_API_KEY
    });
  }
});

// Test route for Garmin auth URL generation
router.get('/test/auth-url', async (req, res) => {
  try {
    const testUserId = 'test-user-123';
    
    // Generate authentication URL using Terra API
    const response = await callTerraAPI('/auth/generateWidgetSession', 'POST', {
      reference_id: testUserId,
      providers: ["GARMIN"],
      language: "en",
      auth_success_redirect_url: `${req.protocol}://${req.get('host')}/api/wearable/callback`,
      auth_failure_redirect_url: `${req.protocol}://${req.get('host')}/api/wearable/callback/error`
    });
    
    res.json({
      success: true,
      widget_url: response.url,
      test_user_id: testUserId
    });
  } catch (error) {
    console.error('Auth URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate auth URL',
      details: error.message
    });
  }
});

export default router;
