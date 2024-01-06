import mongoose from 'mongoose';
import Product from './productSchema.js';

mongoose.pluralize(null);

const collection = 'carts';

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    default: 0,
  },
});

// Método para calcular el total del carrito
cartSchema.methods.calculateTotal = async function () {
  const productIds = this.products.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  let total = 0;

  this.products.forEach((item) => {
    const product = products.find((p) => p._id.toString() === item.product.toString());
    if (product) {
      total += product.price * item.quantity;
    }
  });

  this.total = total;
  return total;
};

export default mongoose.model(collection, cartSchema);


