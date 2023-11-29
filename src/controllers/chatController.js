import ChatMessage from '../models/chatSchema.js';

export class ChatController {
  constructor() {}

  async addChat(chat) {
    try {
      const newMessage = new ChatMessage(chat);
      await newMessage.save();
      return "Mensaje guardado";
    } catch (err) {
      console.error('Error al guardar el mensaje:', err);
      return err.message;
    }
  }

  async getChat() {
    try {
      const chat = await ChatMessage.find().lean();
      return chat;
    } catch (err) {
      console.error('Error al obtener el historial de mensajes:', err);
      return err.message;
    }
  }
}