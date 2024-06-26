import { TicketService } from '../services/tickets.mongo.dao.js'

const ticketService = new TicketService()

export class TicketController {
    constructor() {
    }

    async getTickets() {
        try {
            return await ticketService.getTickets()
        } catch (err) {
            return err.message
        }
    }

    async createdTicket(user) {
        try {
            console.log(user)
            return await ticketService.createdTicket(user)
        } catch (err) {
            return err.message
        }
    }

    async getTicketsById(ticketId) {
        try {
            return await ticketService.getTicketsById(ticketId)
        } catch (err) {
            return err.message
        }
    }

    async deleteTicket(id) {
        try {
            return await ticketService.deleteTicket(id)
        } catch (err) {
            return err.message
        }
    }
}