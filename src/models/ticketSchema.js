import mongoose from 'mongoose'
import bcrypt from 'bcrypt';
import Product from "./productSchema.js";

mongoose.pluralize(null)

const collection = 'tickets'

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    default: () => bcrypt.genSaltSync(8)
  },
  purchase_datetime: {
    type: Date,
    default: new Date().toISOString()
  },
  amount: {
    type: Number,
    default: 0
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      }
    },
  ],
  total: {
    type: Number,
    default: 0,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
});

ticketSchema.pre("find", function () {
  this.populate({ path: "products", model: Product });
});

ticketSchema.methods.calculateTotal = async function () {
  try {
    const productIds = this.products.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let total = 0;

    this.products.forEach((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      if (product && product.stock > 0) {
        total += product.price * item.quantity;
      }
    });

    this.total = total;

    const totalQuantity = this.products.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    this.totalQuantity = totalQuantity;

    return total;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model(collection, ticketSchema);
