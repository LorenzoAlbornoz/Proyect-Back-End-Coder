import mongoose from 'mongoose';
import Product from './productSchema.js';

mongoose.pluralize(null);

const collection = 'favorites';

const favoriteSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
        required: true,
      }
    }
  ]
});


export default mongoose.model(collection, favoriteSchema);