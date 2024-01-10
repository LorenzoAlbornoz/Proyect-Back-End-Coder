import * as url from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import config from './config.js'

// Obtener la ruta del archivo actual y el directorio actual

export const __filename = url.fileURLToPath(import.meta.url)

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
// Función para encriptar la contraseña
export const encryptPassword = (password) => {
    const hash = bcrypt.hashSync(password, parseInt(config.ROUNDS));
    return hash;
};

// Función para comparar la contraseña
export const comparePassword = (password, hash) => {
    const isValid = bcrypt.compareSync(password, hash);
    return isValid;
};

export const generateToken = (payload, duration) => jwt.sign(payload, process.env.PRIVATE_KEY, { expiresIn: duration })

export const authToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies['codertoken'] ? req.cookies['codertoken']: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const receivedToken = headerToken || cookieToken || queryToken
    
    if (!receivedToken) return res.redirect('/login')

    jwt.verify(receivedToken, config.PRIVATE_KEY, (err, credentials) => {
        if (err) return res.status(403).send({ status: 'ERR', data: 'No autorizado' })
        // Si el token verifica ok, pasamos los datos del payload a un objeto req.user
        req.user = credentials
        next()
    })
}
// Rutina de intercepción de errores para passport
export const passportCall = (strategy, options) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, options, (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).send({ status: 'ERR', data: info.messages ? info.messages: info.toString() });
            req.user = user;
            next();
        })(req, res, next);
    }
}