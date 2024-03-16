import userModel from "../models/userSchema.js";
import cartModel from "../models/cartSchema.js";
import favoriteModel from "../models/favoriteSchema.js"
import { encryptPassword} from "../utils.js"; 
import mongoose from 'mongoose';

export class UserService{
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
        } catch (err) {
            return err.message;
        }
    }

    async updateUser(id, updatedUser) {
        try {
            const user = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });
        
            if (!user) {
              // Si no se encuentra el usuario, puedes devolver un código 404
              return {
                mensaje: "Usuario no encontrado",
                status: 404
              };
            }
        
            // Si se actualiza correctamente, devuelves un código 200 y la información del usuario
            return {
              mensaje: "Usuario modificado correctamente",
              status: 200,
              user
            };
          } catch (err) {
            console.error(err); // Imprime el error en la consola
            // En caso de error, puedes devolver un código 500
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
