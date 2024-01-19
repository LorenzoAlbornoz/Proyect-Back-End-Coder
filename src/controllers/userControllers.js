import userModel from "../models/userSchema.js";
import cartModel from "../models/cartSchema.js";
import favoriteModel from "../models/favoriteSchema.js"
import { encryptPassword, comparePassword } from "../utils.js"; 
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from "../config.js";

export class UserController {
    constructor() { }

    async getUsers() {
        try {
            const users = await userModel.find().lean();
            return users;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getUserByID(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new Error("Id inválido");
            }

            const user = await userModel.findById(id);

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                mensaje: "Usuario encontrado",
                status: 200,
                user,
            };
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async register(name, username, password) {
        try {
            const user = await userModel.findOne({ username });

            if (user) {
                throw new Error("El usuario ya existe");
            }

            const newUser = new userModel({
                name,
                username,
                password: encryptPassword(password),
            });

            await newUser.save();

            return {
                mensaje: "Usuario creado exitosamente",
                status: 201,
                newUser,
            };
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async login(username, password) {
        try {
            const user = await userModel.findOne({ username });

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            if (!comparePassword(password, user.password)) {
                throw new Error("La contraseña es inválida");
            }

            const secret = config.JWT_SECRET;

            const payload = {
                sub: user._id,
                name: user.name,
                email: user.username,
                role: user.role,
            };

            const token = jwt.sign(payload, secret, {
                algorithm: config.JWT_ALGORITHM,
                expiresIn: "12h",
            });

            return {
                mensaje: "Inicio de sesión exitoso",
                status: 200,
                token,
            };
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async recoverPassword(username) {
        try {
            const user = await userModel.findOne({ username });

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                mensaje: "Se ha enviado un correo con instrucciones para recuperar la contraseña",
                status: 200,
            };
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async deleteUser(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error("Formato de userId inválido");
            }
    
            // Obtener el usuario antes de eliminarlo
            const user = await userModel.findById(userId);
    
            if (!user) {
                return {
                    mensaje: "Usuario no encontrado",
                    status: 404,
                };
            }
    
            // Eliminar el carrito si existe
            if (user.cart) {
                await cartModel.findByIdAndDelete(user.cart);
            }
    
            // Eliminar la lista de favoritos si existe
            if (user.favorite) {
                await favoriteModel.findByIdAndDelete(user.favorite);
            }
    
            // Eliminar al usuario
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
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async updateUser(id, name, username, password) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new Error("Id inválido");
            }

            const updateFields = {
                ...req.body,
                name,
                username,
            };

            if (password) {
                updateFields.password = encryptPassword(password);
            }

            const user = await userModel.findByIdAndUpdate(id, updateFields, { new: true });

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                mensaje: "Usuario modificado correctamente",
                status: 200,
                user,
            };
        } catch (error) {
            throw new Error("Hubo un error, inténtelo más tarde");
        }
    }

    async getUsersPaginated(page, limit) {
        try {
            return await userModel.paginate(
                { gender: 'Female' },
                { offset: (page * 50) - 50, limit: limit, lean: true }
            );
        } catch (err) {
            throw new Error(err.message);
        }
    }
}
