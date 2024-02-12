import { Router } from 'express'
import passport from 'passport';
import User from "../models/userSchema.js"
import { UserController } from '../controllers/userControllers.js';
import { CartController } from '../controllers/cartControllers.js';
import { FavoriteController } from '../controllers/favoriteControllers.js';
import { comparePassword, generateToken, passportCall, authToken, sendConfirmation } from '../utils.js';
import initPassport from '../config/passport.config.js';
import handlePolicies from '../config/policies.auth.js';

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

router.get('/github', passport.authenticate('githubAuth', { scope: ['user:email'] }), async (req, res) => {
});

router.get('/githubcallback', passport.authenticate('githubAuth', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { _id, email } = req.user;

        // Verifica si el correo electrónico ya está asociado a un usuario existente
        let user = await User.findOne({ email });

        // Crea un nuevo carrito y vincúlalo al usuario
        const newCart = await cartController.createCart(user);

        // Asigna la referencia del carrito al campo 'cart' del usuario
        user.cart = newCart._id;

        // Guarda nuevamente el usuario con la referencia al carrito
        await user.save();

        const access_token = generateToken({
            sub: user.id,
            name: user.name,
            email: user.email,
            name: user.name,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite
        }, '1h')

        // Puedes almacenar el token en cookies, en el cliente, o manejarlo de otra manera según tus necesidades
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        // Redirige al usuario a la vista de productos o cualquier otra página deseada
        res.redirect('/products-views');
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Hubo un error, inténtelo más tarde',
            status: 500,
            error: error.message,
        });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));


router.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const user = req.user

        // Verifica si el usuario ya tiene un carrito
        if (!user.cart) {
            // Si no tiene un carrito, crea uno nuevo y vincúlalo al usuario
            const newCart = await cartController.createCart(user);
            user.cart = newCart._id;
            await user.save();
        }

        // Verifica si el usuario ya tiene un favorito
        if (!user.favorite) {
            // Si no tiene un carrito, crea uno nuevo y vincúlalo al usuario
            const newFavorite = await favoriteController.createFavorite(user);
            user.favorite = newFavorite._id;
            await user.save();
        }

        const access_token = generateToken({
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite
        }, '1h');

        // Puedes almacenar el token en cookies, en el cliente, o manejarlo de otra manera según tus necesidades
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        // Redirige al usuario a la vista de productos u otra página deseada
        res.redirect('/products-views');
    } catch (error) {
        console.error(error);
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
        const user = req.user

        // Verifica si el usuario ya tiene un carrito
        if (!user.cart) {
            // Si no tiene un carrito, crea uno nuevo y vincúlalo al usuario
            const newCart = await cartController.createCart(user);
            user.cart = newCart._id;
            await user.save();
        }

        // Verifica si el usuario ya tiene un favorito
        if (!user.favorite) {
            // Si no tiene un carrito, crea uno nuevo y vincúlalo al usuario
            const newFavorite = await favoriteController.createFavorite(user);
            user.favorite = newFavorite._id;
            await user.save();
        }

        const access_token = generateToken({
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite
        }, '1h');

        // Puedes almacenar el token en cookies, en el cliente, o manejarlo de otra manera según tus necesidades
        res.cookie('codertoken', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        // Redirige al usuario a la vista de productos u otra página deseada
        res.redirect('/products-views');
    } catch (error) {
        console.error(error);
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
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            favorite: user.favorite
        }, '1h')
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


router.post('/restore', passport.authenticate('restoreAuth', { failureRedirect: '/api/failrestore' }), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Clave actualizada' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

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



