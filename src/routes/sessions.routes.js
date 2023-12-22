import { Router } from 'express'
import bcrypt from 'bcrypt';
import User from "../models/userSchema.js"
import { UserController } from '../controllers/userControllers.js';

const router = Router();
const userController = new UserController();


// Creamos un pequeño middleware para una autorización básica
// Observar que aparece next, además de req y res.
// next nos permite continuar la secuencia de la "cadena".
// En este caso, si el usuario es admin, llamanos a next, caso contrario
// devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
// Si ni siquiera se dispone de req.session.user, directamente devolvemos error
// de no autorizado.
const auth = (req, res, next) => {
    try {
        if (req.session.rol === 'admin') {
            next();
        } else {
            res.status(403).send({ status: 'ERR', data: 'Usuario no admin' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
};


router.get('/logout', async (req, res) => {
    try {
        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message });
            } else {
                // Redirige al usuario a la página de inicio de sesión después de cerrar la sesión
                res.redirect('/login');
            }
        });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

// Este es un endpoint "privado", solo visible para admin.
// Podemos ver que el contenido no realiza ninguna verificación, ya que la misma se hace
// inyectando el middleware auth en la cadena (ver definición auth arriba).
// Si todo va bien en auth, se llamará a next() y se continuará hasta aquí, caso contrario
// la misma rutina en auth() cortará y retornará la respuesta con el error correspondiente.
router.get('/admin', auth, async (req, res) => {
    try {
        // Obtiene la lista de usuarios utilizando el controlador
        const users = await userController.getUsers();
        console.log('Users:', users);
        // Renderiza la vista 'admin' y pasa los datos de usuarios
        res.render('admin', {
          title: 'Listado de Usuarios',
          data: users
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR', data: err.message });
    }
});

// Nuestro primer endpoint de login!, básico por el momento, con algunas
// validacione "hardcodeadas", pero nos permite comenzar a entender los conceptos.router.post('/login', async (req, res) => {
    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
    
            if (!user) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado",
                    status: 404,
                });
            }
    
            // Comparar la contraseña directamente sin utilizar bcrypt
            if (password !== user.password) {
                return res.status(400).json({
                    mensaje: "La contraseña es inválida",
                    status: 400,
                });
            }
    
            req.session.username = username;
            req.session.rol = user.rol;
    
            if (user.rol === 'admin') {
                // Si el usuario es admin, redirige a la página de admin
                res.redirect('/api/admin');
            } else {
                // Si el usuario es user, redirige a la lista de productos
                res.redirect('/products-views');
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                mensaje: "Hubo un error, inténtelo más tarde",
                status: 500,
            });
        }
    });
    

router.post('/register', async (req, res) => {
    try {
        const { name, username, password } = req.body;
        console.log('Name:', name);
        console.log('Username:', username);
        console.log('Password:', password);
        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({
                mensaje: "El usuario ya existe",
                status: 400,
            });
        }

        const newUser = new User({
            name,
            username,
            password,
        });

        await newUser.save();

        // Redirigir al usuario a la página de inicio de sesión (login) después de un registro exitoso
        return res.redirect('/login');

    } catch (error) {
        console.log(error);

        // Mantener al usuario en la página de registro en caso de un error en el registro
        return res.render('register', {
            errorMessage: 'Hubo un error en el registro, inténtelo de nuevo.',
        });
    }
});

export default router
