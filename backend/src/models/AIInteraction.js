import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: 'gpt-4-turbo-preview'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AIInteraction', aiInteractionSchema);
