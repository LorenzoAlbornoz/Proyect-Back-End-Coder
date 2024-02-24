import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import Cart from './cartSchema.js'
import Favorite from './favoriteSchema.js'

mongoose.pluralize(null)

const collection = 'users'

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        trim: true
    },
    name: {
        type: String, 
        required: true,
        trim: true,
    },
    age: {
        type: Number, 
        trim: true,
    },
    password:{
        type: String,
        trim: [true, "Tiene espacios"]
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: Cart
    },
    favorite:{
        type: mongoose.Schema.Types.ObjectId,
        ref: Favorite
    },
    role: {
        type:String,
        default: "user",
        enum: ["user", "premium", "admin"]
    }
})

userSchema.plugin(mongoosePaginate)
export default mongoose.model(collection, userSchema)
