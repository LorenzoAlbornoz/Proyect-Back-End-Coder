import express from 'express';
import handlebars from 'express-handlebars'
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
import viewsRouter from './routes/views.routes.js'
import favoriteRouter from './routes/favorite.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import usersRouter from './routes/users.routes.js';
import MongoSingleton from './services/mongo.singleton.js'
import addLogger from './services/wiston.logger.js'

import config from './config.js'

const app = express();

app.use(cors())
app.options('*', cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET_KEY))

// Generamos la configuración inicial para swaggerJsdoc
const swaggerOptions = {
  definition: {
      openapi: '3.0.1',
      info: {
          title: 'Documentación sistema AdoptMe',
          description: 'Esta documentación cubre toda la API habilitada para AdoptMe',
      },
  },
  apis: ['./src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
};
const specs = swaggerJsdoc(swaggerOptions);
    

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

app.use(addLogger)
app.use(config.API, cartsRouter);
app.use(config.API, categoryRouter)
app.use(config.API, productsRouter);
app.use('/', viewsRouter)
app.use(config.API, sessionsRouter)
app.use(config.API, usersRouter);
app.use(config.API, favoriteRouter)
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

