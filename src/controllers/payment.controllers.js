import {PaymentService} from '../services/payment.service.js'

const paymentService = new PaymentService()

export class PaymentController{
    constructor(){
    }

    async checkout(cartId) {
        try {
            return paymentService.checkout(cartId)
        } catch (error) {
            return err.message
        }
    }

}