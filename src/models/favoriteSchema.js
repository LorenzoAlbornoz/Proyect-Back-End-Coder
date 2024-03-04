import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'favorites';

const favoriteSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
      }
    }
  ]
});


export default mongoose.model(collection, favoriteSchema);