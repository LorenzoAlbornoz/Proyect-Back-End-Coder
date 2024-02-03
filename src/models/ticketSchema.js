import mongoose from 'mongoose'
import User from './userSchema.js'

mongoose.pluralize(null)

const collection = 'tickets'

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        require: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now()
    },
    amount: {
        type: Number,
        require: true
    },
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: User,  
        required: true
    }
})

export default mongoose.model(collection, ticketSchema);
