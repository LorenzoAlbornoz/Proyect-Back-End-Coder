import mongoose from 'mongoose'

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
        required: true,
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
;

export default mongoose.model(collection, productSchema)