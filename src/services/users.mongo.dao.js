import userModel from "../models/userSchema.js";
import cartModel from "../models/cartSchema.js";
import favoriteModel from "../models/favoriteSchema.js"
import ticketModel from "../models/ticketSchema.js"
import { encryptPassword } from "../utils.js";
import mongoose from 'mongoose';

export class UserService {
    constructor() {
    }

    async getUsers() {
        try {
            return await userModel.find().lean();
        } catch (err) {
            return err.message;
        }
    }

    async getUserByID(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new Error("Id inválido");
            }

            const user = await userModel.findById(id).populate('documents');

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                mensaje: "Usuario encontrado",
                status: 200,
                user,
            };
        } catch (err) {
            return err.message;
        }
    }

    async deleteUser(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error("Formato de userId inválido");
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return {
                    mensaje: "Usuario no encontrado",
                    status: 404,
                };
            }

            if (user.cart) {
                await cartModel.findByIdAndDelete(user.cart);
            }

            if (user.favorite) {
                await favoriteModel.findByIdAndDelete(user.favorite);
            }

            if (user.ticket) {
                await ticketModel.findByIdAndDelete(user.ticket);
            }

            const deletedUser = await userModel.findByIdAndDelete(userId);

            if (deletedUser) {
                return {
                    mensaje: "Usuario y sus datos asociados eliminados correctamente",
                    status: 200,
                    user: deletedUser,
                };
            } else {
                return {
                    mensaje: "Usuario no encontrado",
                    status: 404,
                };
            }
        } catch (err) {
            return err.message;
        }
    }

    async updateUser(id, updatedUser) {
        try {
            const user = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });

            if (!user) {
                return {
                    mensaje: "Usuario no encontrado",
                    status: 404
                };
            }

            return {
                mensaje: "Usuario modificado correctamente",
                status: 200,
                user
            };
        } catch (err) {
            return {
                mensaje: "Error interno del servidor",
                status: 500
            };
        }
    };

    async getUsersPaginated(page, limit) {
        try {
            return await userModel.paginate(
                { gender: 'Female' },
                { offset: (page * 50) - 50, limit: limit, lean: true }
            );
        } catch (err) {
            return err.message;
        }
    }
}
