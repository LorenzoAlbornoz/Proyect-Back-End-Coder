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
                amount: 0,
                user: user._id,
                total: 0,
                totalQuantity: 0,
                products: [],
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