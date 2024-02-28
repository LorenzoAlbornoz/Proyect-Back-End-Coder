import ticketModel from '../models/ticketSchema.js'

export class TicketService{
    constructor(){
    }

    async getTickets(){
        try {
            const tickets = await ticketModel.find().lean()
            return tickets
        } catch (err) {
            return err.message
        }
    }

    async getTicketsById(id) {
        try {
            const ticket = await ticketModel.findById(id).lean()
            return ticket
        } catch (error) {
            return err.message
        }
    }

    async deleteTicket(id){
        try {
            const deleteTicket = await ticketModel.findByIdAndDelete(id)
            return deleteTicket
        } catch (error) {
            return err.message
        }
    }
}