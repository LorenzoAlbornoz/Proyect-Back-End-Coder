
import passport from 'passport'
import LocalStrategy from 'passport-local'
import GithubStrategy from 'passport-github2'
import GoogleStrategy from 'passport-google-oauth20'
import jwt from 'passport-jwt'
import userModel from '../models/userSchema.js'
import { encryptPassword, comparePassword } from '../utils.js';
import config from '../config.js'

const initPassport = () => {
    // Función utilizada por la estrategia registerAuth
    const verifyRegistration = async (req, username, password, done) => {
        try {
            const { name, email, age } = req.body

            if (!name || !email || !age) {
                return done('Se requiere nombre, usuario y contraseña en el body', false)
            }

            const user = await userModel.findOne({ email: username })

            // El usuario ya existe, llamamos a done() para terminar el proceso de
            // passport, con null (no hay error) y false (sin devolver datos de usuario)
            if (user) return done(null, false)

            const newUser = {
                name,
                email,
                age,
                password: createHash(password)
            }

            const process = await userModel.create(newUser)

            return done(null, process)
        } catch (err) {
            return done(`Error passport local: ${err.message}`)
        }
    }

    // Función utilizada por la estrategia restoreAuth
    const verifyRestoration = async (req, username, password, done) => {
        try {
            if (username.length === 0 || password.length === 0) {
                return done('Se requiere email y password en el body', false)
            }

            const user = await userModel.findOne({ email: username })

            // El usuario no existe, no podemos restaurar nada.
            // Llamamos a done() para terminar el proceso de
            // passport, con null (no hay error) y false (sin devolver datos de usuario)
            if (!user) return done(null, false)

            const process = await userModel.findOneAndUpdate({ email: username }, { password: encryptPassword(password) })

            return done(null, process)
        } catch (err) {
            return done(`Error passport local: ${err.message}`)
        }
    }

    const verifyGithub = async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await userModel.findOne({ username: profile.username });

            if (!user) {
                const newUser = {
                    name: profile.displayName,
                    email: profile.username,
                    password: '',
                    role: 'user'
                };

                const process = await userModel.create(newUser);

                return done(null, process);
            } else {
                done(null, user);
            }
        } catch (err) {
            return done(`Error passport Github: ${err.message}`);
        }
    };


    const verifyGoogle = async (req, accessToken, refreshToken, profile, done) => {
        try {
            /**
             * Al igual que en el caso de Github, tomamos datos del profile para armar
             * nuestro user. Podríamos por supuesto verificar existencia en nuestra bbdd
             * y cargar un nuevo usuario, como lo hacemos en la estrategia de Github.
             */
            const user = {
                name: profile.displayName,
                email: profile.emails[0].value,
                password: '',
                role: 'user'
            }

            return done(null, user);
        } catch (err) {
            return done(`Error passport Google: ${err.message}`)
        }
    }


    const verifyJwt = async (payload, done) => {
        try {
            return done(null, payload);
        } catch (err) {
            return done(err);
        }
    }

    /**
     * Passport no opera con las cookies de forma directa, por lo cual creamos
     * una función auxiliar que extrae y retorna la cookie del token si está disponible
     */
    const cookieExtractor = (req) => {
        let token = null;
        if (req && req.cookies) token = req.cookies['codertoken'];
        return token;
    }

    // Creamos estrategia local de autenticación para registro
    passport.use('registerAuth', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'username',
        passwordField: 'password'
    }, verifyRegistration))

    // Creamos estrategia local de autenticación para restauración de clave
    passport.use('restoreAuth', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'username',
        passwordField: 'password'
    }, verifyRestoration))

    // Creamos estrategia para autenticación externa con Github
    passport.use('githubAuth', new GithubStrategy({
        clientID: config.GITHUB_AUTH.clientId,
        clientSecret: config.GITHUB_AUTH.clientSecret,
        callbackURL: 'http://localhost:8080/api/githubcallback'
    }, verifyGithub))

    passport.use('googleAuth', new GoogleStrategy({
        clientID: config.GOOGLE_AUTH.clientId,
        clientSecret: config.GOOGLE_AUTH.clientSecret,
        callbackURL: 'http://localhost:8080/api/googlecallback',
        passReqToCallback: true
    }, verifyGoogle))

    // Estrategia para autenticación con JWT
    passport.use('jwtAuth', new jwt.Strategy({
        jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.SECRET_KEY
    }, verifyJwt))

    // Métodos "helpers" de passport para manejo de datos de sesión
    // Son de uso interno de passport, normalmente no tendremos necesidad de tocarlos.
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            done(null, await userModel.findById(id))
        } catch (err) {
            done(err.message)
        }
    })
}

export default initPassport

