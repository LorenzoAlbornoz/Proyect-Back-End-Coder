import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import Category from './categorySchema.js';
// import User from './userSchema.js'

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
    images: {
        type: [String]
    },
    code: {
       type: String,
       required: true
    },
    stock: {
        type: Number,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false 
    },
    isOffer: {
        type: Boolean,
        default: false
    },
    // owner: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: User,
    //     default: "admin",
    // }
})

productSchema.plugin(mongoosePaginate)
export default mongoose.model(collection, productSchema)