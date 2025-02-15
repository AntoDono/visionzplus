import express from 'express';
import OpenAI from 'openai';
import AIInteraction from '../models/AIInteraction.js';

const router = express.Router();

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
      model: "gpt-4-turbo-preview",
    });

    const response = completion.choices[0].message.content;

    // Save interaction to MongoDB
    const interaction = new AIInteraction({
      prompt,
      response,
      model: "gpt-4-turbo-preview"
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
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      details: error.message 
    });
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
