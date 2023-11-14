import express from 'express'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io' 

import productsRouter from './routes/products.routes.js'
import cartsRouter from './routes/carts.routes.js'
import viewsRouter from './routes/views.routes.js'
import {__dirname} from './utils.js'
import ProductManager from '../ProductManager.js'

const productManager = new ProductManager('./products.json');

const PORT = 8080;

const app = express()

const httpServer= app.listen(PORT, () => {
    console.log(`Servicio activo en puerto ${PORT}`)
})

const socketServer = new Server(httpServer)
socketServer.on('connection', async (socket) => {
    console.log('Cliente conectado');
  
    try {
      // Envía la lista de productos al cliente cuando se conecta
      const products = await productManager.getProducts();
      socket.emit('productos', products);
    } catch (error) {
      console.error('Error al enviar la lista de productos:', error);
    }
  });

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

app.use('/', viewsRouter)
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.use('/static', express.static(`${__dirname}/public`))



