import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'category'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model(collection, categorySchema);

