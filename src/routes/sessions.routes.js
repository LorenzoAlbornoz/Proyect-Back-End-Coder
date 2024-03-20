import { Router } from 'express'
import passport from 'passport';
import User from "../models/userSchema.js"
import { UserController } from '../controllers/userControllers.js';
import { CartController } from '../controllers/cartControllers.js';
import { FavoriteController } from '../controllers/favoriteControllers.js';
import { encryptPassword, comparePassword, generateToken, passportCall, authToken, sendConfirmation } from '../utils.js';
import initPassport from '../config/passport.config.js';

initPassport()
const router = Router();
const userController = new UserController();
const cartController = new CartController();
const favoriteController = new FavoriteController();


// Creamos un pequeño middleware para una autorización básica
// Observar que aparece next, además de req y res.
// next nos permite continuar la secuencia de la "cadena".
// En este caso, si el usuario es admin, llamanos a next, caso contrario
// devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
// Si ni siquiera se dispone de req.session.user, directamente devolvemos error
// de no autorizado.
const authenticationMid = (req, res, next) => {
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

const authorizationMid = role => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })
        if (req.user.role !== role) return res.status(403).send({ status: 'ERR', data: 'Sin permisos suficientes' })
        next();
    }
}

// Nuevo middleware para manejo de políticas (roles)
// que nos permite indicar en el endpoint un array de roles válidos, no solo uno.
const handlePolicies = policies => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })

        // Normalizamos todo a mayúsculas para comparar efectivamente
        const userRole = req.user.role.toUpperCase();
        policies.forEach((policy, index) => policies[index] = policies[index].toUpperCase());

        if (policies.includes('PUBLIC')) return next();
        if (policies.includes(userRole)) return next();
        res.status(403).send({ status: 'ERR', data: 'Sin permisos suficientes' });
    }
}

router.get('/current', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
    if (req.user) {
        res.status(200).send({ status: 'OK', data: req.user });
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

// Este es un endpoint "privado", solo visible para admin.
// Podemos ver que el contenido no realiza ninguna verificación, ya que la misma se hace
// inyectando el middleware auth en la cadena (ver definición auth arriba).
// Si todo va bien en auth, se llamará a next() y se continuará hasta aquí, caso contrario
// la misma rutina en auth() cortará y retornará la respuesta con el error correspondiente.

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

// Nuestro primer endpoint de login!, básico por el momento, con algunas
// validacione "hardcodeadas", pero nos permite comenzar a entender los conceptos.router.post('/login', async (req, res) => {
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
        res.redirect('/products-views');
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
            error: error.message,
        });
    }
});

router.post('/register',passport.authenticate('registerAuth', { failureRedirect: '/api/auth/failregister' }), sendConfirmation('email', 'register'), async (req, res) => {
    try {

        const user = req.user
        // Crea un nuevo carrito y lo vincula al usuario recién creado
        const newCart = await cartController.createCart(user);

        // Asigna la referencia del carrito al campo 'cart' del usuario
        user.cart = newCart._id;

        // Crea un nuevo favorito y lo vincula al usuario recién creado
        const newFavorite = await favoriteController.createFavorite(user);

        // Asigna la referencia del favorito al campo 'favorite' del usuario
        user.favorite = newFavorite._id;

        // Guarda nuevamente el usuario con la referencia al carrito
        await user.save();

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

// router.get('/current', passport.authenticate('jwtAuth', { session: false }), async (req, res) => {
// La función passportCall nos permite una mejor intercepción de errores (ver utils.js)
// Este endpoint muestra cómo podemos encadenar distintos middlewares en el proceso,
// aquí primero autenticamos y luego autorizamos.

router.post('/restore', passport.authenticate('restoreAuth', { failureRedirect: '/api/failrestore' }), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Clave actualizada' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

export default router



