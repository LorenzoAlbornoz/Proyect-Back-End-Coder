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
      const cart = await this.getCartById(cartId);

      if (typeof cart !== 'string') {
        const productsWithStock = cart.products.filter(product => product.product.stock > 0);

        if (productsWithStock.length === 0) {
          return { status: 'ERR', data: 'No hay productos disponibles para comprar en el carrito' };
        }

        const lineItems = productsWithStock.map(product => ({
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
          mode: 'payment',
          success_url: 'http://localhost:5173/cart/success',
          cancel_url: 'http://localhost:5173/cart/cancel'
        };

        const service = new PaymentService();
        const payment = await service.createPaymentSession(data);

        return { status: 'OK', data: payment };
      } else {
        return { status: 'ERR', data: cart };
      }
    } catch (err) {
      return { status: 'ERR', data: err.message };
    }
  }

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

  async clearCart(cartId) {
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

  async processPurchase(cartId, ticketId) {
    try {
      const result = await cartService.processPurchase(cartId, ticketId)
      if (result.success) {
        return { status: 'OK', data: { ticketId: result.ticketId } };
      } else {
        return { status: 'ERR', data: { error: result.error } };
      }
    } catch (error) {
      return { status: 'ERR', data: { error: error.message } };
    }
  }
}