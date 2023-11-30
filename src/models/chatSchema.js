import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'chatMessages';

const chatSchema = new mongoose.Schema({
  username: {
    type: String,
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

