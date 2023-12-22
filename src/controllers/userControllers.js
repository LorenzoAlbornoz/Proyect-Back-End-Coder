import userModel from "../models/userSchema.js"

export class UserController {
    constructor() {
    }

    async getUsers() {
        try {
            const users = await userModel.find().lean()
            // const users = await userModel.find({ first_name: 'Celia' }).explain('executionStats')
            return users
        } catch (err) {
            return err.message
        }
        
    }

    async getUsersPaginated(page, limit) {
        try {
            // Podemos usar el método paginate gracias a que hemos agregado el módulo mongoose-paginate-v2.
            // También podríamos hacerlo manualmente, pero este módulo es muy cómodo y nos devuelve todos
            // los datos necesarios en la respuesta para armar el paginado en el frontend.
            // Por supuesto, los valores de offset y limit, pueden llegar como parámetros.
            return await userModel.paginate(
                { gender: 'Female' },
                { offset: (page * 50) - 50, limit: limit, lean: true }
            )
        } catch (err) {
            return err.message
        }
    }
}

// export const getAllUsers = async (req, res) => {
//   const users = await User.find();
//   try {
//     if (!users) {
//       return res.status(404).json({
//         mensaje: "Usuarios no encontrados",
//         status: 404,
//       });
//     }

//     return res.status(200).json({
//       mensaje: "Usuarios encontrados",
//       status: 200,
//       users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       mensaje: "Hubo un error, inténtelo más tarde",
//       status: 500,
//     });
//   }
// };

// export const getUserByID = async (req, res) => {
//   const { id } = req.params;
//   const user = await User.findById(id);
//   try {
//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         mensaje: "Id inválido",
//         status: 400,
//       });
//     }

//     if (!user) {
//       return res.status(404).json({
//         mensaje: "Usuario no encontrado",
//         status: 404,
//       });
//     }

//     return res.status(200).json({
//       mensaje: "Usuario encontrado",
//       status: 200,
//       user
//     });
//   } catch (error) {
//     return res.status(500).json({
//       mensaje: "Hubo un error, inténtelo más tarde",
//       status: 500
//     });
//   }
// };

//   export const register = async (req, res) => {
//     const { name, username, password } = req.body;
//     const user = await User.findOne({ username });
//     try {
//       if (user) {
//         return res.status(400).json({
//           mensaje: "El usuario ya existe",
//           status: 400,
//         });
//       }
  
//       const newUser = new User({
//         name,
//         username,
//         password: encryptPassword(password),
//       });
  
//       await newUser.save();
//       res.status(201).json({
//         mensaje: "Usuario creado exitosamente",
//         status: 201,
//         newUser,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         mensaje: "Hubo un error, inténtelo más tarde",
//         status: 500,
//       });
//     }
//   };

//   export const login = async (req, res) => {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     const secret = process.env.JWT_SECRET;
//     try {
//       if (!user) {
//         return res.status(404).json({
//           mensaje: "Usuario no encontrado",
//           status: 404,
//         });
//       }
//       if (!comparePassword(password, user.password)) {
//         return res.status(400).json({
//           mensaje: "La contraseña es invalida",
//           status: 400,
//         });
//       }
//       const payload = {
//         sub: user._id,
//         email: user.username,
//         name: user.name,
//         rol: user.rol
//       };
//       const token = jwt.sign(payload, secret, {
//         algorithm: process.env.JWT_ALGORITHM,
//         expiresIn: "12h"
//       });
//       return res.status(200).json({
//         mensaje: "Inicio de sesión exitoso",
//         status: 200,
//         token
//       });
//     } catch (error) {
//       return res.status(500).json({
//         mensaje: "Hubo un error, inténtelo más tarde",
//         status: 500
//       });
//     }
//   };

//   export const recoverPassword = async (req, res) => {
//     const { username } = req.body;
//     const user = await User.findOne({ username });
  
//     try {
//       if (!user) {
//         return res.status(404).json({
//           mensaje: "Usuario no encontrado",
//           status: 404,
//         });
//       }
//       return res.status(200).json({
//         mensaje: "Se ha enviado un correo con instrucciones para recuperar la contraseña",
//         status: 200,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         mensaje: "Hubo un error, inténtelo más tarde",
//         status: 500,
//       });
//     }
//   };

// export const deleteUser = async (req, res) => {
//   const { id } = req.params;
//   const user = await User.findByIdAndDelete(id);
//   try {
//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         mensaje: "Id inválido",
//         status: 400,
//       });
//     }
//     if (!user) {
//       return res.status(404).json({
//         mensaje: "Usuario no encontrado",
//         status: 404,
//       });
//     }

//     return res.status(200).json({
//       mensaje: "Usuario borrado correctamente",
//       status: 200,
//       user,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       mensaje: "Hubo un error, inténtelo más tarde",
//       status: 500,
//     });
//   }
// };


// export const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { name, username, password } = req.body;
//   try {
//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         mensaje: "Id inválido",
//         status: 400,
//       });
//     }
//     if(req.body.password){
//     const user = await User.findByIdAndUpdate(
//       id,
//       {
//         ...req.body,
//         name,
//         username,
//         password: encryptPassword(password)
//       },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         mensaje: "Usuario no encontrado",
//         status: 404
//       });
//     }

//     return res.status(200).json({
//       mensaje: "Usuario modificado correctamente",
//       status: 200,
//       user
//     });
//   }
//   const user = await User.findByIdAndUpdate(
//     id,
//     {
//       ...req.body,
//       name,
//       username
//     },
//     { new: true }
//   );

//   if (!user) {
//     return res.status(404).json({
//       mensaje: "Usuario no encontrado",
//       status: 404
//     });
//   }

//   return res.status(200).json({
//     mensaje: "Usuario modificado correctamente",
//     status: 200,
//     user
//   });
//   } catch (error) {
//     return res.status(500).json({
//       mensaje: "Hubo un error, inténtelo más tarde",
//       status: 500
//     });
//   }
// };





