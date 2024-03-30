import { Router } from 'express'
import {TicketController} from '../controllers/ticketControllers.js'

const router = Router()
const ticketController = new TicketController()

router.get('/tickets', async (req, res) => {
    try {
      const tickets = await ticketController.getTickets()
  
      res.status(200).send({status: 'OK', tickets})
    } catch (error) {
      res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
    }
  })

  router.get('/ticket/:ticketId', async (req, res) => {
    try {
      const ticket =  await ticketController.getTicketsById(req.params.ticketId);
      res.status(200).send({status: 'OK', ticket})
    } catch (error) {
      res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
    }
  })

  router.delete('/ticket/:id' , async (req, res) => {
    try {
        const deleteTicketResult = await ticketController.deleteTicket(req.params.id);

        res.status(deleteTicketResult.status).json({ mensaje: deleteTicketResult.mensaje });
    } catch (error) {
      console.log(error)
        res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
    }
});


export default router