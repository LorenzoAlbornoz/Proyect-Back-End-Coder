import passport from 'passport'
import LocalStrategy from 'passport-local'
import GithubStrategy from 'passport-github2'
import GoogleStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'
import jwt from 'passport-jwt'
import userModel from '../models/userSchema.js'
import { encryptPassword, comparePassword } from '../utils.js';
import config from '../config.js'

const initPassport = () => {
    // Función utilizada por la estrategia registerAuth
    const verifyRegistration = async (req, email, password, done) => {
        try {
            const { name, email, age } = req.body

            if (!name || !email || !age) {
                return done('Se requiere nombre, usuario y contraseña en el body', false)
            }

            const user = await userModel.findOne({ email })

            // El usuario ya existe, llamamos a done() para terminar el proceso de
            // passport, con null (no hay error) y false (sin devolver datos de usuario)
            if (user) return done(null, false)

            const newUser = {
                email,
                name,
                age,
                password: encryptPassword(password)
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

    passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_AUTH.clientId,
        clientSecret: config.GOOGLE_AUTH.clientSecret,
        callbackURL: "http://localhost:8080/api/googlecallback"
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                // Buscar si ya existe un usuario con el mismo googleId
                let user = await userModel.findOne({ googleId: profile.id });
    
                if (user) {
                    // Si el usuario ya existe, autenticar y devolver el usuario
                    return done(null, user);
                }
    
                // Si no existe, buscar si existe un usuario con el mismo nombre
                let existingUser = await userModel.findOne({ name: profile.displayName });
    
                if (existingUser) {
                    // Si el usuario con el mismo nombre ya existe, también autenticar y devolver el usuario existente
                    return done(null, existingUser);
                }
    
                // Si no existe ningún usuario, crea un nuevo usuario
                const newUser = {
                    name: profile.displayName,
                    googleId: profile.id
                };
    
                const createdUser = await userModel.create(newUser);
    
                // Devolver el nuevo usuario creado
                return done(null, createdUser);
            } catch (error) {
                return done(error);
            }
        }
    ));
    
    passport.use(new FacebookStrategy({
        clientID: config.FACEBOOK_AUTH.clientId,
        clientSecret: config.FACEBOOK_AUTH.clientSecret,
        callbackURL: "http://localhost:8080/api/facebookcallback"
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                // Buscar si ya existe un usuario con el mismo nombre
                let user = await userModel.findOne({ facebookId: profile.id });

                if (user) {
                    // Si el usuario ya existe, autenticar y devolver el usuario
                    return done(null, user);
                }

                // Si no existe, buscar si existe un usuario con el mismo nombre
                let existingUser = await userModel.findOne({ name: profile.displayName });

                if (existingUser) {
                    // Si el usuario con el mismo nombre ya existe, también autenticar y devolver el usuario existente
                    return done(null, existingUser);
                }

                // Si no existe ningún usuario, crea un nuevo usuario
                const newUser = {
                    name: profile.displayName,
                    facebookId: profile.id
                };

                const process = await userModel.create(newUser);

                // Devolver el nuevo usuario creado
                return done(null, process);
            } catch (error) {
                return done(error);
            }
        }
    ));

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
        usernameField: 'name',
        passwordField: 'password'
    }, verifyRegistration))

    // Creamos estrategia local de autenticación para restauración de clave
    passport.use('restoreAuth', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'name',
        passwordField: 'password'
    }, verifyRestoration))

    // Estrategia para autenticación con JWT
    passport.use('jwtAuth', new jwt.Strategy({
        jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.SECRET_KEY
    }, verifyJwt))

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

