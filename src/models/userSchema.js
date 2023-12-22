import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true,
    },
    username:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        trim: [true, "Tiene espacios"]
    },
    rol: {
        type:String,
        default: "user",
        enum: ["user", "admin"]
    }
})

userSchema.plugin(mongoosePaginate)
export default mongoose.model(collection, userSchema)
