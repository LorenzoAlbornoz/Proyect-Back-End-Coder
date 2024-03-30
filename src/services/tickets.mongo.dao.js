import ticketModel from '../models/ticketSchema.js'

export class TicketService {
    constructor() {
    }

    async getTickets() {
        try {
            const tickets = await ticketModel.find().lean()
            return tickets
        } catch (err) {
            return err.message
        }
    }

    async getTicketsById(ticketId) {
        try {
            const ticket = await ticketModel.findById(ticketId).populate('products.product');
            return ticket
        } catch (error) {
            return err.message
        }
    }

    async createdTicket(user) {
        try {
            const newTicket = {
                purchase_datetime: new Date(),
                amount: 0, // Aquí puedes establecer el monto inicial del ticket según tus requisitos
                user: user._id,
                total: 0, // Puedes establecer el total inicial del ticket según tus requisitos
                totalQuantity: 0, // Puedes establecer la cantidad total inicial del ticket según tus requisitos
                products: [],// Puedes inicializar la lista de productos del ticket según tus requisitos
            };
            const createdTicket = await ticketModel.create(newTicket);
            return createdTicket;
        } catch (err) {
            return err.message;
        }
    }

    async deleteTicket(id) {
        try {
            const deleteTicket = await ticketModel.findByIdAndDelete(id)
            return deleteTicket
        } catch (error) {
            return err.message
        }
    }
}