import { UserService } from "../services/users.mongo.dao.js";

const userService = new UserService()

export class UserController {
    constructor() { }

    async getUsers() {
        try {
            return await userService.getUsers()
        } catch (err) {
            return err.message
        }
    }

    async getUserByID(id) {
        try {
            return await userService.getUserByID(id)
        } catch (err) {
            return err.message
        }
    }

    async deleteUser(userId) {
        try {
            return await userService.deleteUser(userId)
        } catch (err) {
            return err.message
        }
    }

    async updateUser(id, name, password, role) {
        try {
            return await userService.updateUser(id, name, password, role)
        } catch (err) {
            return err.message
        }
    }

    async getUsersPaginated(page, limit) {
        try {
            return await userService.getUsersPaginated(page, limit)
        } catch (err) {
            return err.message
        }
    }

    async changeToRole(id){
        try {
            return await userService.changeToRole(id)
        } catch (error) {
            return err.message
        }
    }

    createUserDTO(user) {
        return {
            id: user.sub,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }
}
