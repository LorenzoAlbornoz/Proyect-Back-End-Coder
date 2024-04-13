import passport from 'passport'
import LocalStrategy from 'passport-local'
import GoogleStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'
import jwt from 'passport-jwt'
import userModel from '../models/userSchema.js'
import { encryptPassword } from '../utils.js';
import config from '../config.js'
import { CartController } from '../controllers/cartControllers.js';
import { FavoriteController } from '../controllers/favoriteControllers.js';
import { TicketController } from '../controllers/ticketControllers.js'

const cartController = new CartController();
const favoriteController = new FavoriteController();
const ticketController = new TicketController();

const initPassport = () => {
    const verifyRegistration = async (req, username, password, done) => {
        try {

            const { name, email } = req.body;

            if (!name || !email) {
                return done('Se requiere nombre, usuario y contraseña en el body', false);
            }

            const user = await userModel.findOne({ email: username });

            if (user) {
                return done(null, false);
            }

            const newUser = {
                email,
                name,
                password: encryptPassword(password),
                last_connection: new Date(),
            };

            const createdUser = await userModel.create(newUser);

            const newCart = await cartController.createCart(createdUser);
            createdUser.cart = newCart._id;

            const newTicket = await ticketController.createdTicket(createdUser)
            createdUser.ticket = newTicket._id;

            const newFavorite = await favoriteController.createFavorite(createdUser);
            createdUser.favorite = newFavorite._id;

            await createdUser.save();

            return done(null, createdUser);
        } catch (err) {
            return done(`Error passport local: ${err.message}`);
        }
    };

    const verifyRestoration = async (req, username, password, done) => {
        try {
            if (username.length === 0 || password.length === 0) {
                return done('Se requiere email y password en el body', false)
            }

            const user = await userModel.findOne({ email: username })

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
        callbackURL: "https://proyect-back-end-coder-8.onrender.com/api/auth/google/callback"
    }, async function (profile, done) {
        try {
            let user = await userModel.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            let existingUser = await userModel.findOne({ name: profile.displayName });

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = {
                name: profile.displayName,
                googleId: profile.id
            };

            const createdUser = await userModel.create(newUser);

            const newCart = await cartController.createCart(createdUser);
            createdUser.cart = newCart._id;

            const newFavorite = await favoriteController.createFavorite(createdUser);
            createdUser.favorite = newFavorite._id;

            const newTicket = await ticketController.createdTicket(createdUser)
            createdUser.ticket = newTicket._id;

            await createdUser.save();

            return done(null, createdUser);
        } catch (error) {
            return done(error);
        }
    }));


    passport.use(new FacebookStrategy({
        clientID: config.FACEBOOK_AUTH.clientId,
        clientSecret: config.FACEBOOK_AUTH.clientSecret,
        callbackURL: "https://proyect-back-end-coder-8.onrender.com/api/auth/facebook/callback"
    }, async function (profile, done) {
        try {
            let user = await userModel.findOne({ facebookId: profile.id });

            if (user) {
                return done(null, user);
            }

            let existingUser = await userModel.findOne({ name: profile.displayName });

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = {
                name: profile.displayName,
                facebookId: profile.id
            };

            const createdUser = await userModel.create(newUser);

            const newCart = await cartController.createCart(createdUser);
            createdUser.cart = newCart._id;

            const newFavorite = await favoriteController.createFavorite(createdUser);
            createdUser.favorite = newFavorite._id;

            const newTicket = await ticketController.createdTicket(createdUser);
            createdUser.ticket = newTicket._id;

            await createdUser.save();

            return done(null, createdUser);
        } catch (error) {
            return done(error);
        }
    }));

    const verifyJwt = async (payload, done) => {
        try {
            return done(null, payload);
        } catch (err) {
            return done(err);
        }
    }

    const cookieExtractor = (req) => {
        let token = null;
        if (req && req.cookies) token = req.cookies['codertoken'];
        return token;
    }

    passport.use('registerAuth', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'name',
        passwordField: 'password'
    }, verifyRegistration))

    passport.use('restoreAuth', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'name',
        passwordField: 'password'
    }, verifyRestoration))

    passport.use('jwtAuth', new jwt.Strategy({
        jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.SECRET_KEY
    }, verifyJwt))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (err) {
            done(err.message)
        }
    })
}

export default initPassport

