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

ticketSchema.pre('save', async function (next) {
    try {
        // Generate a unique code (you can customize this part based on your requirements)
        this.code = generateUniqueCode();

        next();
    } catch (error) {
        next(error);
    }
});

// Function to generate a unique code
function generateUniqueCode() {
    // Implement your code generation logic here
    // For example, you can use a combination of timestamp and random number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return timestamp + random;
}


export default mongoose.model(collection, ticketSchema);
