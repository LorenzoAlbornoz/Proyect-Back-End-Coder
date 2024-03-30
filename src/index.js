import express from 'express';
import cors from "cors"
import cloudinary from 'cloudinary'
import cookieParser from 'cookie-parser';
import session from 'express-session'
import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

import { __dirname } from './utils.js'
import productsRouter from './routes/products.routes.js';
import categoryRouter from './routes/category.routes.js'
import cartsRouter from './routes/carts.routes.js';
import favoriteRouter from './routes/favorite.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import usersRouter from './routes/users.routes.js';
import ticketsRouter from './routes/ticket.routes.js'
import MongoSingleton from './services/mongo.singleton.js'
import addLogger from './services/wiston.logger.js'

import config from './config.js'

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.options('*', cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET_KEY))

const swaggerOptions = {
  definition: {
      openapi: '3.0.1',
      info: {
          title: 'Documentación sistema AdoptMe',
          description: 'Esta documentación cubre toda la API habilitada para AdoptMe',
      },
  },
  apis: ['./src/docs/**/*.yaml'],
};
const specs = swaggerJsdoc(swaggerOptions);
    

const fileStorage = FileStore(session)
app.use(session({
    store: MongoStore.create({ mongoUrl: config.MONGODB_CONNECTION, mongoOptions: {}, ttl: 60, clearInterval: 5000 }),
    secret: config.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

cloudinary.config({
    cloud_name:config.CLOUD_NAME,
    api_key:config.APY_KEY,
    api_secret: config.APY_SECRET
});

app.use(addLogger)
app.use(config.API, cartsRouter);
app.use(config.API, categoryRouter)
app.use(config.API, productsRouter);
// app.use('/', viewsRouter)
app.use(config.API, sessionsRouter)
app.use(config.API, usersRouter);
app.use(config.API, favoriteRouter);
app.use(config.API, ticketsRouter);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use('/static', express.static(`${__dirname}/public`))

app.use((err, req, res, next) => {
  const code = err.code || 500;
  res.status(code).send({ status: 'ERR', data: err.message });
});

    app.use((err, req, res, next) => {
      const code = err.code || 500;
      const message = err.message || 'Hubo un problema, error desconocido';
      
      return res.status(code).send({
          status: 'ERR',
          data: message,
      });
  });

app.all('*', (req, res, next)=>{
   res.status(404).send({status: 'ERR', data: config.errorsDictionary.PAGE_NOT_FOUND})
})

const port = config.PORT

MongoSingleton.getInstance();

app.listen(port, () => {
    console.log(`Backend activo modo ${config.MODE} puerto ${port}`)
})