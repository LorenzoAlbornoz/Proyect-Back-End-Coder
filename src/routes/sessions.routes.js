import { Router } from 'express'
import passport from 'passport';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import initPassport from '../config/passport.config.js';
import config from '../config.js';
import { comparePassword, generateToken, sendConfirmation, encryptPassword } from '../utils.js';
import User from "../models/userSchema.js"

initPassport()
const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        console.log("Google callback endpoint hit.");
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { last_connection: new Date() });
        console.log("Usuario autenticado:", req.user);

        const access_token = generateToken({
            sub: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart,
            favorite: req.user.favorite,
            ticket: req.user.ticket
        }, '1h');
        console.log("Token generado:", access_token);

        // Crear el objeto user_data
        const user_data = {
            role: req.user.role,
            cart: req.user.cart,
            sub: req.user._id,
            favorite: req.user.favorite,
            ticket: req.user.ticket
        };

        const user_data_json = JSON.stringify(user_data);
        console.log("Datos del usuario:", user_data_json);

        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true, domain: 'frabega.netlify.app'});
        res.cookie('user_data', user_data_json, { maxAge: 60 * 60 * 1000, httpOnly: false, domain: 'frabega.netlify.app'});

        res.redirect('https://frabega.netlify.app');
    } catch (error) {
        console.error("Error en el endpoint de Google callback:", error);
        res.status(500).json({
            mensaje: 'Hubo un error, inténtelo más tarde',
            status: 500,
            error: error.message,
        });
    }
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebookcallback', passport.authenticate('facebook', { failureRedirect: '/login' }), async (req, res) => {
    try {
        console.log("Facebook callback endpoint hit.");
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { last_connection: new Date() });
        console.log("Usuario autenticado:", req.user);

        const access_token = generateToken({
            sub: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart,
            favorite: req.user.favorite,
            ticket: req.user.ticket
        }, '1h');
        console.log("Token generado:", access_token);

        // Crear el objeto user_data
        const user_data = {
            role: req.user.role,
            cart: req.user.cart,
            sub: req.user._id,
            favorite: req.user.favorite,
            ticket: req.user.ticket
        };

        const user_data_json = JSON.stringify(user_data);
        console.log("Datos del usuario:", user_data_json);

        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true, domain: 'frabega.netlify.app'});
        res.cookie('user_data', user_data_json, { maxAge: 60 * 60 * 1000, httpOnly: false, domain: 'frabega.netlify.app'});

        res.redirect('https://frabega.netlify.app');
    } catch (error) {
        console.error("Error en el endpoint de Facebook callback:", error);
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

        const userId = user._id;
        await User.findByIdAndUpdate(userId, { last_connection: new Date() });

        const access_token = generateToken({
            sub: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite,
            ticket: user.ticket,
        }, '1h')
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
        res.json({ token: access_token });
    } catch (error) {
        res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
            error: error.message,
        });
    }
});

router.get('/failregister', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email ya existe o faltan datos obligatorios' })
})

router.post('/register', passport.authenticate('registerAuth', { failureRedirect: '/api/auth/failregister' }), sendConfirmation('email', 'register'), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Usuario registrado, por favor revise su casilla de correo.' })
    } catch (err) {
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
                user: config.GOOGLE_APP_EMAIL,
                pass: config.GOOGLE_APP_PASS
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
                <a href="https://frabega.netlify.app/reset_password/${user._id}/${encodeURIComponent(token)}">
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

                    return res.redirect('https://frabega.netlify.app/api/login');
                } else {
                    return res.json({ Status: "Error con el token" });
                }
            } else {
                const user = await User.findById(id);
                if (!user) {
                    return res.status(404).json({ Status: "Usuario no encontrado" });
                }


                if (password === user.password) {
                    return res.status(400).json({ Status: "No se puede utilizar la misma contraseña" });
                }

                const isSameAsPrevious = comparePassword(password, user.password);
                if (isSameAsPrevious) {
                    return res.status(400).json({ Status: "SamePassword", Message: "La nueva contraseña es igual a la anterior" });
                }

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



