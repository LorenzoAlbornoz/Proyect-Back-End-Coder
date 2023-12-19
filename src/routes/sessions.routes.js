import { Router } from 'express'
import bcrypt from 'bcrypt';
import User from "../models/userSchema.js"

const router = Router()

// Creamos un pequeño middleware para una autorización básica
// Observar que aparece next, además de req y res.
// next nos permite continuar la secuencia de la "cadena".
// En este caso, si el usuario es admin, llamanos a next, caso contrario
// devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
// Si ni siquiera se dispone de req.session.user, directamente devolvemos error
// de no autorizado.
const auth = (req, res, next) => {
    try {
        if (req.session.user) {
            if (req.session.user.admin === true) {
                next()
            } else {
                res.status(403).send({ status: 'ERR', data: 'Usuario no admin' })
            }
        } else {
            res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
}

// Este endpoint es para testeo.
// Si es la primer visita desde esa instancia de navegador, req.session.visits no existirá,
// por ende se inicializará en 1 y se dará la bienvenida.
// En sucesivas visitas, ya estará disponible en req.session, por ende solo se lo incrementará.
// Continuará incrementando visita a visita hasta que caduque o se destruya la sesión.
router.get('/session', async (req, res) => {
    try {
        if (req.session.visits) {
            req.session.visits++
            res.status(200).send({ status: 'OK', data: `Cantidad de visitas: ${req.session.visits}` })
        } else {
            req.session.visits = 1
            res.status(200).send({ status: 'OK', data: 'Bienvenido al site!' })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.get('/logout', async (req, res) => {
    try {
        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                res.status(200).send({ status: 'OK', data: 'Sesión finalizada' })
            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

// Este es un endpoint "privado", solo visible para admin.
// Podemos ver que el contenido no realiza ninguna verificación, ya que la misma se hace
// inyectando el middleware auth en la cadena (ver definición auth arriba).
// Si todo va bien en auth, se llamará a next() y se continuará hasta aquí, caso contrario
// la misma rutina en auth() cortará y retornará la respuesta con el error correspondiente.
router.get('/admin', auth, async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Estos son los datos privados' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

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
            res.redirect('/profile')
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
        res.status(201).json({
            mensaje: "Usuario creado exitosamente",
            status: 201,
            newUser,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
        });
    }
});


export default router
