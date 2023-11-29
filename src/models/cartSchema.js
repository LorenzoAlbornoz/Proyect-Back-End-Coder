import mongoose from 'mongoose'
import Product from './productSchema.js'

mongoose.pluralize(null)

const collection = 'carts'

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
    })
;

export default mongoose.model(collection, cartSchema)

