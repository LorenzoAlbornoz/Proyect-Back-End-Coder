import { Router } from 'express'
import passport from 'passport';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import initPassport from '../config/passport.config.js';
import handlePolicies from '../config/policies.auth.js';
import config from '../config.js';
import { comparePassword, generateToken, authToken, sendConfirmation, encryptPassword } from '../utils.js';
import User from "../models/userSchema.js"
import { UserController } from '../controllers/userControllers.js';
import { CartController } from '../controllers/cartControllers.js';
import { FavoriteController } from '../controllers/favoriteControllers.js';

initPassport()
const router = Router();
const userController = new UserController();
const cartController = new CartController();
const favoriteController = new FavoriteController();

router.get('/current', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
    if (req.user) {
        const userDTO = userController.createUserDTO(req.user);
        res.status(200).send({ status: 'OK', data: userDTO });
    } else {
        res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' });
    }
});

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('codertoken');

        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                // El endpoint puede retornar el mensaje de error, o directamente
                // redireccionar a login o una página general.
                // res.status(200).send({ status: 'OK', data: 'Sesión finalizada' })
                res.redirect('/login')
            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.get('/admin', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
    try {
        // Obtén tus datos de alguna manera (pueden provenir de una base de datos, API, etc.)
        const users = await userController.getUsers(); // Esto es un ejemplo, reemplázalo con tu lógica de obtención de datos

        // Renderiza la vista de administrador con los datos de los usuarios
        res.render('admin', { title: 'Lista de Usuarios', data: { users } });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

router.get('/failregister', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email ya existe o faltan datos obligatorios' })
})

router.get('/failrestore', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email no existe o faltan datos obligatorios' })
})

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        console.log('Callback de Google llamado correctamente');
        console.log('Usuario autenticado:', req.user);

        // Realiza acciones adicionales si es necesario

        // Genera un token de acceso
        const access_token = generateToken({
            sub: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart,
            favorite: req.user.favorite
        }, '1m');
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: true })
        res.cookie('user_data', JSON.stringify({role: req.user.role, cart: req.user.cart,sub: req.user._id, favorite : req.user.favorite}), { maxAge: 60 * 60 * 1000, httpOnly: false});
        res.redirect('http://localhost:5173/');
    } catch (error) {
        console.error('Error en /api/googlecallback:', error);
        res.status(500).json({
            mensaje: 'Hubo un error, inténtelo más tarde',
            status: 500,
            error: error.message,
        });
    }
});


// Ruta de autenticación de Facebook
router.get('/facebook', passport.authenticate('facebook'));

// Ruta de retorno después de la autenticación de Facebook
router.get('/facebookcallback', passport.authenticate('facebook', { failureRedirect: '/login' }), async (req, res) => {
    try {
        console.log('Callback de Facebook llamado correctamente');
        console.log('Usuario autenticado:', req.user);

        // Realiza acciones adicionales si es necesario

        // Genera un token de acceso
        const access_token = generateToken({
            sub: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart,
            favorite: req.user.favorite
        }, '1m');
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: true })
        res.cookie('user_data', JSON.stringify({role: req.user.role,cart: req.user.cart,sub: req.user._id, favorite : req.user.favorite}), { maxAge: 60 * 60 * 1000, httpOnly: false});
        res.redirect('http://localhost:5173/');
    } catch (error) {
        console.error('Error en /api/facebookcallback:', error);
        res.status(500).json({
            mensaje: 'Hubo un error, inténtelo más tarde',
            status: 500,
            error: error.message,
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado",
                status: 404,
            });
        }

        const isPasswordValid = comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                mensaje: "La contraseña es inválida",
                status: 400,
            });
        }

        const access_token = generateToken({
            sub: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite
        }, '1m')
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
        res.json({ token: access_token });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
            error: error.message,
        });
    }
});

router.post('/register', passport.authenticate('registerAuth', { failureRedirect: '/api/auth/failregister' }), sendConfirmation('email', 'register'), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Usuario registrado, por favor revise su casilla de correo.' })
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/user/recover', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                mensaje: "El usuario no existe",
                status: 404
            });
        }

        const token = jwt.sign({ id: user._id }, config.PRIVATE_KEY, { expiresIn: "1h" });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user:config.GOOGLE_APP_EMAIL,
                pass:config.GOOGLE_APP_PASS
            }
        });

        const mailOptions = {
            from: 'fravega@gmail.com',
            to: user.email,
            subject: 'Recuperación de Contraseña',
            html: `
                <p>Hola ${user.name},</p>
                <p>Recibes este correo porque has solicitado restablecer tu contraseña en nuestro sistema.</p>
                <p>Para cambiar tu contraseña, haz clic en el siguiente botón:</p>
                <a href="http://localhost:5173/reset_password/${user._id}/${encodeURIComponent(token)}">
                    <button style="background-color: #4CAF50; /* Green */
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;">Restablecer Contraseña</button>
                </a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no has solicitado este restablecimiento, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
                <p>Gracias,</p>
                <p>Tu equipo de Soporte</p>
            `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).send({ status: 'ERR', data: error.message });
            } else {
                res.send({ Status: "Success" });
            }
        });

    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

router.put('/user/reset/:id/:token', async (req, res) => {
    try {
        const { id, token } = req.params;
        const { password } = req.body;

        jwt.verify(token, config.PRIVATE_KEY, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    // Redirigir a /login si el token ha expirado
                    return res.redirect('http://localhost:5173/login');
                } else {
                    return res.json({ Status: "Error con el token" });
                }
            } else {
                const user = await User.findById(id);
                if (!user) {
                    return res.status(404).json({ Status: "Usuario no encontrado" });
                }

                // Verificar si la nueva contraseña es igual a la actual
                if (password === user.password) {
                    return res.status(400).json({ Status: "No se puede utilizar la misma contraseña" });
                }

                // Verificar si la nueva contraseña es igual a la anterior
                const isSameAsPrevious = comparePassword(password, user.password);
                if (isSameAsPrevious) {
                    return res.status(400).json({ Status: "SamePassword", Message: "La nueva contraseña es igual a la anterior" });
                }

                // Actualizar la contraseña
                user.password = encryptPassword(password);
                await user.save();

                res.status(200).json({ Status: "Éxito" });
            }
        });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});


router.get('/loggerTest', async (req, res) => {
    try {
        req.logger.debug('Este es un mensaje de debug');
        req.logger.http('Este es un mensaje de http');
        req.logger.info('Este es un mensaje de info');
        req.logger.warn('Este es un mensaje de warning');
        req.logger.error('Este es un mensaje de error');
        req.logger.fatal('Este es un mensaje fatal');

        res.status(200).json({ mensaje: 'Logs probados. Revisa los archivos de registro.' });
    } catch (error) {
        req.logger.error('Hubo un error al probar los logs:', error.message);
        res.status(500).json({ mensaje: 'Hubo un error, inténtelo más tarde', status: 500 });
    }
});

export default router



