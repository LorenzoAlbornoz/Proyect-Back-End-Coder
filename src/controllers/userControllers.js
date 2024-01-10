import userModel from "../models/userSchema.js";
import productModel from '../models/productSchema.js'
import cartModel from '../models/cartSchema.js'
import config from "../config.js";

export class UserController {
    constructor() { }

    async getUsers() {
        try {
            const users = await userModel.find().lean();
            return users;
        } catch (err) {
            return err.message;
        }
    }

    async getUserByID(id) {
        try {
            const user = await userModel.findById(id);
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    mensaje: "Id inválido",
                    status: 400,
                });
            }
            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }
            return res.status(200).json({
                mensaje: "Usuario encontrado",
                status: 200,
                user,
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    }

    async register(req, res) {
        const { name, username, password } = req.body;
        const user = await userModel.findOne({ username });
        try {
            if (user) {
                return res.status(400).json({
                    mensaje: "El usuario ya existe",
                    status: 400,
                });
            }

            const newUser = new userModel({
                name,
                username,
                password: encryptPassword(password),
            });

            await newUser.save();
            res.status(201).json({
                mensaje: "Usuario creado exitosamente",
                status: 201,
                newUser,
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        const secret = config.JWT_SECRET;
        try {
            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }
            if (!comparePassword(password, user.password)) {
                return res.status(400).json({
                    mensaje: "La contraseña es inválida",
                    status: 400,
                });
            }
            const payload = {
                sub: user._id,
                name: user.name,
                email: user.username,
                name: user.name,
                role: user.role,
            };
            const token = jwt.sign(payload, secret, {
                algorithm: config.JWT_ALGORITHM,
                expiresIn: "12h",
            });
            return res.status(200).json({
                mensaje: "Inicio de sesión exitoso",
                status: 200,
                token,
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    }

    async recoverPassword(req, res) {
        const { username } = req.body;
        const user = await userModel.findOne({ username });
        try {
            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }
            return res.status(200).json({
                mensaje: "Se ha enviado un correo con instrucciones para recuperar la contraseña",
                status: 200,
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    }
    
    async deleteUser(req, res) {
        const  {userId}  = req.params;
        try {
            const user = await userModel.findByIdAndDelete(userId);
    
            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }
    
            return res.status(200).json({
                mensaje: "Usuario borrado correctamente",
                status: 200,
                user,
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    }

    async updateUser(req, res) {
        const { id } = req.params;
        const { name, username, password } = req.body;
        try {
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    mensaje: "Id inválido",
                    status: 400,
                });
            }
            if (req.body.password) {
                const user = await userModel.findByIdAndUpdate(
                    id,
                    {
                        ...req.body,
                        name,
                        username,
                        password: encryptPassword(password),
                    },
                    { new: true }
                );

                if (!user) {
                    return res.status(404).json({
                        mensaje: "Usuario no encontrado",
                        status: 404,
                    });
                }

                return res.status(200).json({
                    mensaje: "Usuario modificado correctamente",
                    status: 200,
                    user,
                });
            }
            const user = await userModel.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    name,
                    username,
                },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }

            return res.status(200).json({
                mensaje: "Usuario modificado correctamente",
                status: 200,
                user,
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }

    }
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
