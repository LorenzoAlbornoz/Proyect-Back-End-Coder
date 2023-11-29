import express from 'express'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'

import productsRouter from './routes/products.routes.js'
import cartsRouter from './routes/carts.routes.js'
import viewsRouter from './routes/views.routes.js'
import usersRouter from './routes/users.routes.js'
import {__dirname} from './utils.js'

const PORT = 8080
// Atención!, puede haber problemas al utilizar localhost,
// tratar siempre de armar la URL local con 127.0.0.1
const MONGOOSE_URL = 'mongodb+srv://coder_55605:coder_55605@cluster-coder.jzhx9ku.mongodb.net/'

try {
    await mongoose.connect(MONGOOSE_URL)
    
    // Si deseamos integrar socket.io, guardamos la instancia
    // de express y se la pasamos al new Server
    const app = express()
    const httpServer = app.listen(PORT, () => {
        console.log(`Backend activo puerto ${PORT} conectado a BBDD`)
    })
    
    const socketServer = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
            credentials: false
        } 
    })
    
    // Ponemos al servidor de socket a escuchar conexiones
    // y habilitamos DENTRO las escuchas a tópicos específicos
    // que nos interesen
    socketServer.on('connection', socket => {
        // Escuchamos por el tópico llamado new_message
        // (solo ejemplo, cambiar al que se necesite)
        // y emitimos otro hacia todos los clientes
        socket.on('new_message', data => {
            socketServer.emit('message_added', data)
        })
    })

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set('socketServer', socketServer)

app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

app.use('/', viewsRouter)
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/api/users', usersRouter)

app.use('/static', express.static(`${__dirname}/public`))
} catch(err) {
    console.log(`Backend: error al inicializar (${err.message})`)
}

