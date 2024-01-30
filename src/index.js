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
import favoriteRouter from './routes/favorite.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import usersRouter from './routes/users.routes.js';


import config from './config.js'

const app = express();

app.use(cors())
app.options('*', cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET_KEY))
    

const fileStorage = FileStore(session)
app.use(session({
    store: MongoStore.create({ mongoUrl: config.MONGODB_CONNECTION, mongoOptions: {}, ttl: 60, clearInterval: 5000 }), // MONGODB
    secret: config.SECRET_KEY,
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
    cloud_name:config.CLOUD_NAME,
    api_key:config.APY_KEY,
    api_secret: config.APY_SECRET
});

app.use(config.API, cartsRouter);
app.use(config.API, categoryRouter)
app.use(config.API, productsRouter);
app.use('/', viewsRouter)
app.use(config.API, sessionsRouter)
app.use(config.API, usersRouter);
app.use(config.API, favoriteRouter)

app.use('/static', express.static(`${__dirname}/public`))

const port = config.PORT

mongoDBConnection()

app.listen(port, () => {
    console.log(`mi servidor esta funcionando en el puerto ${port}`)
})

