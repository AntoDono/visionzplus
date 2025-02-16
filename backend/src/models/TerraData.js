import mongoose from 'mongoose';

const terraDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  data: {
    activity: Object,
    daily: Object,
    sleep: Object,
    body: Object
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const TerraData = mongoose.model('TerraData', terraDataSchema);

export default TerraData;
