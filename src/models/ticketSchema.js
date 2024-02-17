import mongoose from 'mongoose'
import User from './userSchema.js'
import bcrypt from 'bcrypt';

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
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: User,  
        required: true
    }
})

export default mongoose.model(collection, ticketSchema);
