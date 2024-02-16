import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import Category from './categorySchema.js';

mongoose.pluralize(null)

const collection = 'products'

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true 
    },
    description: {
        type: String,
        required:true 
    },
    price: {
        type: Number,
        default: 0,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Category
    },
    image: {
        type: String
    },
    code: {
       type: String,
       required: true
    },
    stock: {
        type: Number,
        required: true
    }
})

productSchema.plugin(mongoosePaginate)
export default mongoose.model(collection, productSchema)