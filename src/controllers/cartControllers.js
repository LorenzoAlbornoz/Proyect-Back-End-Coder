import cartModel from '../models/cartSchema.js'

export class CartController {
    constructor() {
    }

    async createCart() {
        try {
            const newCart = {
              products: [],
            };
            const createdCart = await cartModel.create(newCart);
            return createdCart;
          } catch (error) {
            throw error;
          }
    }

    async getCartById(id) {
        try {
            const cart = await cartModel.findById(id).populate('products.product')
            return cart === null ? 'No se encuentra el carrito' : cart
        } catch (err) {
            return err.message
        }
    }

    async addProductToCart(cartId, productId) {
      try {
        const cart = await cartModel.findById(cartId);

        if (!cart) {
            return null; // El carrito no existe
        }

        // Verificar si el producto ya está en el carrito
        const existingProduct = cart.products.find(product => product.product.toString() === productId);

        if (existingProduct) {
            // Si el producto ya está en el carrito, aumentar la cantidad
            existingProduct.quantity += 1;
        } else {
            // Si el producto no está en el carrito, agregarlo con cantidad 1
            const productToAdd = {
                product: productId,
                quantity: 1,
            };

            cart.products.push(productToAdd);
        }
          const updatedCart = await cart.save();
          return updatedCart;
        } catch (error) {
          throw error;
        }
      }

      async editProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await cartModel.findById(cartId);
    
            if (!cart) {
                return null; // El carrito no existe
            }
    
            const productIndex = cart.products.findIndex(product => product.product.toString() === productId);
    
            if (productIndex !== -1) {
                // Si se encuentra el producto en el carrito, actualiza la cantidad
                cart.products[productIndex].quantity = newQuantity;
                const updatedCart = await cart.save();
                return updatedCart;
            } else {
                return null; // El producto no está en el carrito
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteProductFromCart(cartId, productId) {
      try {
          const cart = await cartModel.findById(cartId);
  
          if (!cart) {
              return null; // El carrito no existe
          }
  
          const updatedProducts = cart.products.filter(product => product.product.toString() !== productId);
  
          if (updatedProducts.length < cart.products.length) {
              // Si se eliminó algún producto, actualiza el carrito
              cart.products = updatedProducts;
              const updatedCart = await cart.save();
              return updatedCart;
          } else {
            res.status(204).send();
              return null; // El producto no estaba en el carrito
          }
      } catch (error) {
          throw error;
      }
  }

    async deleteCart(id) {
        try {
            const procedure = await cartModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}

