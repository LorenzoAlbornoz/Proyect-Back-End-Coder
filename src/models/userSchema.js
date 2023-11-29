import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'users'

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        require: true,
        trim: true,
    },
    username:{
        type: String,
        require: true,
        trim: true
    },
    password:{
        type: String,
        require: true,
        trim: [true, "Tiene espacios"]
    },
    rol: {
        type:String,
        default: "user",
        enum: ["user", "admin"]
    }
})

export default mongoose.model(collection, userSchema)
