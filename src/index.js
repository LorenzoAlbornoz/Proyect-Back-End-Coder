import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';
import usersRouter from './routes/users.routes.js';
import { __dirname } from './utils.js';

const PORT = 8080;
const MONGOOSE_URL = 'mongodb+srv://coder_55605:coder_55605@cluster-coder.jzhx9ku.mongodb.net/';

// Conexión a la base de datos MongoDB
try {
    await mongoose.connect(MONGOOSE_URL);
    console.log('Conexión a MongoDB establecida');
} catch (err) {
    console.log(`Error al conectar a MongoDB: ${err.message}`);
    process.exit(1);
}

// Configuración y creación de la instancia de Express
const app = express();

// Configuración y creación del servidor HTTP para Express y Socket.io
const httpServer = app.listen(PORT, () => {
    console.log(`Servicio activo en puerto ${PORT}`);
});

// Configuración de CORS para Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
        credentials: false,
    },
});

// Inicialización de mensajes para el chat
let messages = [];

// Configuración de Socket.io
io.on('connection', (socket) => {
    socket.emit('messagesLogs', messages);
    console.log(`Chat actual enviado a ${socket.id}`);
    
    socket.on('user_connected', (data) => {
        socket.broadcast.emit('user_connected', data);
    });
    
    socket.on('message', (data) => {
        messages.push(data);
        io.emit('messagesLogs', messages);
    });
});

// Configuración de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.set('socketServer', io);

app.use('/api/chat', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);

app.use('/static', express.static(`${__dirname}/public`));

