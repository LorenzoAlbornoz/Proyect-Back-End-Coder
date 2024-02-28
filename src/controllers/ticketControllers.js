import {TicketService} from '../services/tickets.mongo.dao.js'

const ticketService = new TicketService()

export class TicketController{
    constructor(){
    }

    async getTickets() {
        try {
            return await ticketService.getTickets()
        } catch (error) {
            return err.message
        }
    }

    async getTicketsById(id) {
        try {
            return await ticketService.getTicketsById(id)
        } catch (error) {
            return err.message
        }
    }

    async deleteTicket(id) {
        try {
            return await ticketService.deleteTicket(id)
        } catch (error) {
            return err.message
        }
    }
}