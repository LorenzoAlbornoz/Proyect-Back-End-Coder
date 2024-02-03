import { CartService } from "../services/carts.mongo.dao.js";

const cartService = new CartService()

export class CartController {
  constructor() {
  }

  async getCartById(userId) {
    try {
      return await cartService.getCartById(userId)
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


  async getCartQuantity(cartId) {
    try {
      return await cartService.getCartQuantity(cartId)
    } catch (err) {
      return err.message
    }
  }

  async processPurchase(userId){
    try {
      const result = await cartService.processPurchase(userId)
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
