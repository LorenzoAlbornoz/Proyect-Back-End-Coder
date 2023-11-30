import { Router } from 'express'
import { ChatController } from '../controllers/chatController.js'

const router = Router()
const controller = new ChatController()

// Solo habilitamos un endpoint /chat para probar el chat websockets
router.get('/', async (req, res) => {
    try {
        const chat = await controller.getChat();
        res.render('chat', {
            title: 'Coder Compras Chat',
            chat: chat,
        });
    } catch (error) {
        console.error('Error al obtener el chat:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/', async (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
    }

    const newContent = {
        username,
        message,
    };

    try {
        const result = await controller.addChat(newContent);
        res.status(200).send({ status: 'OK', data: result });
    } catch (error) {
        console.error('Error al agregar mensaje al chat:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default router

