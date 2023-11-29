import mongoose from 'mongoose';
import User from './userSchema.js'

mongoose.pluralize(null);

const collection = 'chatMessages';

const chatSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: User,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(collection, chatSchema);