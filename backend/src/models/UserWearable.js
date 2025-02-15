import mongoose from 'mongoose';

const userWearableSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
    description: 'User email used as reference ID for Terra'
  },
  terraUserId: {
    type: String,
    required: true,
    description: 'Terra-specific user ID'
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
    activity: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
      description: 'Map of summary_id to activity data'
    },
    daily: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
      description: 'Map of start_time to daily data'
    },
    sleep: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
      description: 'Map of summary_id to sleep data'
    },
    body: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
      description: 'Map of start_time to body data'
    }
  },
  pendingRequests: {
    reference: String,
    endpoints: [String],
    startDate: String,
    endDate: String,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['initiated', 'processing', 'receiving', 'completed', 'error'],
      default: 'initiated'
    },
    chunksReceived: {
      type: Number,
      default: 0
    },
    totalChunks: Number
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
userWearableSchema.index({ userId: 1 });
userWearableSchema.index({ terraUserId: 1 });
userWearableSchema.index({ 'pendingDataRequests.reference': 1 });

const UserWearable = mongoose.model('UserWearable', userWearableSchema);

export default UserWearable;
