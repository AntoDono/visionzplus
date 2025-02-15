import express from 'express';
import OpenAI from 'openai';
import AIInteraction from '../models/AIInteraction.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "o3-mini",
    });

    const response = completion.choices[0].message.content;

    // Save interaction to MongoDB
    const interaction = new AIInteraction({
      prompt,
      response,
      model: "o3-mini",
      timestamp: new Date()
    });

    await interaction.save();

    res.json({
      success: true,
      data: {
        response,
        interactionId: interaction._id
      }
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    
    // Handle specific error types
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key',
        details: 'Please check your OPENAI_API_KEY environment variable'
      });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: 'OpenAI API quota exceeded',
        details: 'Please check your OpenAI account billing status'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate AI response',
      details: error.message
    });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }

    const prompt = `
      Given the following data analysis context:
      ${JSON.stringify(context)}

      User Question: ${question}

      Please provide a clear and concise answer based on the data analysis context.
      Focus on explaining the insights and patterns in a way that's easy to understand.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const interactions = await AIInteraction.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: interactions
    });
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AI interaction history',
      details: error.message 
    });
  }
});

export default router;
