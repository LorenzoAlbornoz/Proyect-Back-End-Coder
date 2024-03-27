import { CartService } from "../services/carts.mongo.dao.js";
import PaymentService from '../services/payment.service.js';

const cartService = new CartService()

export class CartController {
  constructor() {
  }

  async getCartById(cartId) {
    try {
      return await cartService.getCartById(cartId)
    } catch (err) {
      return err.message;
    }
  }

  async createCart(user) {
    try {
      return await cartService.createCart(user)
    } catch (err) {
      return err.message
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      return await cartService.addProductToCart(cartId, productId)
    } catch (err) {
      return err.message
    }
  }

  async checkout(cartId) {
    try {
        // Obtener el carrito por su ID, asegurándose de que los productos estén poblados
        const cart = await this.getCartById(cartId);

        if (typeof cart !== 'string') {
            // Construir los datos para la creación de la sesión de pago en Stripe

           
            const lineItems = cart.products.map(product => ({
                price_data: {
                    currency: product.currency,
                    product_data: {
                        name: product.product.title,
                        images: [product.product.images[0]]
                    },
                    unit_amount: product.unit_amount / 100,
                },
                quantity: product.quantity,
            }));

            const data = {
                line_items: lineItems,
                mode: 'payment', // Puede ser 'subscription' para habilitar pagos recurrentes
                success_url: 'http://localhost:8080/api/cart/success',
                cancel_url: 'http://localhost:8080/api/cart/cancel'
            };
            console.log('Datos de pago:', JSON.stringify(data, null, 2));

            // Crear la sesión de pago en Stripe
            const service = new PaymentService();
            const payment = await service.createPaymentSession(data);

            return { status: 'OK', data: payment };
        } else {
            // Si hay un error al obtener el carrito, enviar una respuesta de error
            return { status: 'ERR', data: cart };
        }
    } catch (err) {
        console.error('Error al procesar el pago:', err);
        return { status: 'ERR', data: err.message };
    }
} 

  async

  async editProductQuantity(cartId, productId, newQuantity) {
    try {
      return await cartService.editProductQuantity(cartId, productId, newQuantity)
    } catch (err) {
      return err.message
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      return await cartService.deleteProductFromCart(cartId, productId)
    } catch (err) {
      return err.message
    }
  }

  async deleteCart(id) {
    try {
      return await cartService.deleteCart(id)
    } catch (err) {
      return err.message
    }
  }

  async clearCart(cartId){
    try {
      return await cartService.clearCart(cartId)
    } catch (error) {
      return err.message 
    }
  }


  async getCartQuantity(cartId) {
    try {
      return await cartService.getCartQuantity(cartId)
    } catch (err) {
      return err.message
    }
  }

  async processPurchase(cartId, userId){
    try {
      const result = await cartService.processPurchase(cartId, userId)
      if (result.success) {
        return { status: 'OK', data: { ticketId: result.ticketId } };
      } else {
        return { status: 'ERR', data: { error: result.error } };
      }
    } catch (error) {
      console.error("Error in processPurchase:", error);
      return { status: 'ERR', data: { error: error.message } };
    }
  }
}