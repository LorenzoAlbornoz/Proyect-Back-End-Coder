import * as url from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import config from './config.js'
import nodemailer from 'nodemailer'

const mailerService = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GOOGLE_APP_EMAIL,
        pass: config.GOOGLE_APP_PASS
    }
})

export const sendConfirmation = () => {
    return async (req, res, next) => {
        try {
            if (req.user && req.user.name && req.user.email) {
                const subject = 'CODERStore confirmación registro';
                const html = `
                    <h1>CODERStore confirmación registro</h1>
                    <p>Muchas gracias por registrarte ${req.user.name} !, te hemos dado de alta en nuestro sistema con el email ${req.user.email}</p>
                `;

                await mailerService.sendMail({
                    from: config.GOOGLE_APP_EMAIL,
                    to: req.user.email,
                    subject: subject,
                    html: html
                });
                next();
            } else {

                res.status(400).send({ status: 'ERR', data: 'Datos de usuario incompletos para enviar confirmación.' });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message });
        }
    }
}


export const __filename = url.fileURLToPath(import.meta.url)

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export const encryptPassword = (password) => {
    const hash = bcrypt.hashSync(password, parseInt(config.ROUNDS));
    return hash;
};

export const comparePassword = (password, hash) => {
    const isValid = bcrypt.compareSync(password, hash);
    return isValid;
};

export const generateToken = (payload, duration) => jwt.sign(payload, config.PRIVATE_KEY, { expiresIn: duration })

export const authToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies['codertoken'] ? req.cookies['codertoken'] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken

    if (!receivedToken) return res.redirect('/login')

    jwt.verify(receivedToken, config.PRIVATE_KEY, (err, credentials) => {
        if (err) return res.status(403).send({ status: 'ERR', data: 'No autorizado' })
        req.user = credentials
        next()
    })
}

export const passportCall = (strategy, options) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, options, (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).send({ status: 'ERR', data: info.messages ? info.messages : info.toString() });
            req.user = user;
            next();
        })(req, res, next);
    }
}
