import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'category'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "El nombre es obligatorio"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model(collection, categorySchema);

