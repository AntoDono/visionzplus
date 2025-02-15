import mongoose from 'mongoose';

const userWearableSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  terraUserId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['GARMIN', 'FITBIT', 'OURA', 'WHOOP', 'OTHER'],
    required: true
  },
  scopes: {
    type: String
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  healthData: {
    activity: [{
      type: mongoose.Schema.Types.Mixed
    }],
    daily: [{
      type: mongoose.Schema.Types.Mixed
    }],
    sleep: [{
      type: mongoose.Schema.Types.Mixed
    }],
    body: [{
      type: mongoose.Schema.Types.Mixed
    }]
  },
  pendingDataRequests: [{
    reference: String,
    requestedAt: Date,
    endpoints: [String],
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Create indexes for faster queries
userWearableSchema.index({ userId: 1 });
userWearableSchema.index({ terraUserId: 1 });
userWearableSchema.index({ 'pendingDataRequests.reference': 1 });

const UserWearable = mongoose.model('UserWearable', userWearableSchema);

export default UserWearable;
