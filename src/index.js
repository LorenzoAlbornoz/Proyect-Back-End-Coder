import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import handlebars from 'express-handlebars'
import cors from "cors"
import cloudinary from 'cloudinary'
import cookieParser from 'cookie-parser';
import session from 'express-session'
import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'
import passport from 'passport'

import { __dirname } from './utils.js'
import mongoDBConnection from './database/db.js'
import productsRouter from './routes/products.routes.js';
import categoryRouter from './routes/category.routes.js'
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import usersRouter from './routes/users.routes.js';

const app = express();

app.use(cors())
app.options('*', cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secretKeyAbc123'))
    

const fileStorage = FileStore(session)
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_CONNECTION, mongoOptions: {}, ttl: 60, clearInterval: 5000 }), // MONGODB
    secret: 'secretKeyAbc123',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Configurar Handlebars
app.engine('handlebars', handlebars.engine({
    // Agregar las siguientes opciones de tiempo de ejecución
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  }));
  app.set('views', `${__dirname}/views`)
  app.set('view engine', 'handlebars')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.APY_KEY,
    api_secret: process.env.APY_SECRET
});

app.use(process.env.API, cartsRouter);
app.use(process.env.API, categoryRouter)
app.use(process.env.API, productsRouter);
app.use('/', viewsRouter)
app.use(process.env.API, sessionsRouter)
app.use(process.env.API, usersRouter);

app.use('/static', express.static(`${__dirname}/public`))

const port = process.env.PORT

mongoDBConnection()

app.listen(port, () => {
    console.log(`mi servidor esta funcionando en el puerto ${port}`)
})

