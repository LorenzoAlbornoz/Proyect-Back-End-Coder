import userModel from '../models/userSchema.js'

export class UserController {
    constructor(){
    }

    async addUser(user) {
        try {
            await userModel.create(user)
            return "Usuario creado"
        } catch (err) {
            return err.message
        }
    }

    async getUsers(){
        try {
            const users = await userModel.find().lean()
            return users
        } catch (err) {
            return err.message
        }
    }

    async getUserById(id) {
        try {
            const user = await userModel.findById(id)
            return user === null ? 'No se encontro el usuario' : user
        } catch (err) {
            return err.message
        }
    }

    async updateUser(id, newContent) {
        try {
            const procedure = await userModel.findByIdAndUpdate(id, newContent)
            return procedure
        } catch (err) {
            return err.message
        }
    }
    
    async deleteUser(id) {
        try {
            const procedure = await userModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}