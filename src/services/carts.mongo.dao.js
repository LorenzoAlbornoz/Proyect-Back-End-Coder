import cartModel from '../models/cartSchema.js'
import ticketModel from '../models/ticketSchema.js'
import productModel from '../models/productSchema.js'

export class CartService {
    constructor() {
    }
    async createCart(user) {
        try {
            const newCart = {
                products: [],
                user: user._id,
            };
            const createdCart = await cartModel.create(newCart);
            return createdCart;
        } catch (err) {
            return err.message;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product');

            if (!cart) {
                return 'No se encuentra el carrito';
            }

            const total = cart.products.reduce((acc, product) => {
                return acc + (product.product.price * product.quantity);
            }, 0);

            const totalQuantity = cart.products.reduce((acc, product) => {
                return acc + product.quantity;
            }, 0);

            cart.total = total;
            cart.totalQuantity = totalQuantity;

            return cart;
        } catch (err) {
            return err.message;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);

            if (!cart) {
                return null;
            }

            const product = await productModel.findById(productId);

            const existingProduct = cart.products.find(product => product.product.toString() === productId);
            if (existingProduct) {

                existingProduct.quantity += 1;
            } else {

                const productToAdd = {
                    product: productId,
                    quantity: 1,
                    currency: 'usd',
                    unit_amount: Math.round(product.price * 100),
                };

                cart.products.push(productToAdd);
            }
            const updatedCart = await cart.save();
            return updatedCart;
        } catch (err) {
            return err.message;
        }
    }

    async editProductQuantity(cartId, productId, newQuantity) {
        try {
            newQuantity = parseInt(newQuantity);

            if (isNaN(newQuantity) || newQuantity < 0) {
                throw new Error('La nueva cantidad debe ser un número positivo');
            }

            const cart = await cartModel.findById(cartId);

            if (!cart) {
                throw new Error('El carrito no existe');
            }

            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {

                cart.products[productIndex].quantity = newQuantity;

                const updatedCart = await cart.save();

                return updatedCart;
            } else {
                throw new Error('El producto no está en el carrito');
            }
        } catch (err) {
            throw new Error('Error al actualizar la cantidad del producto en el carrito');
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);

            if (!cart) {
                return null;
            }

            const updatedProducts = cart.products.filter(product => product.product.toString() !== productId);

            if (updatedProducts.length < cart.products.length) {
                cart.products = updatedProducts;
                const updatedCart = await cart.save();
                return updatedCart;
            } else {
                return null;
            }
        } catch (err) {
            return err.message
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await cartModel.findById(cartId);

            if (!cart) {
                return null;
            }

            cart.products = [];

            const updatedCart = await cart.save();
            return updatedCart;
        } catch (err) {
            return err.message;
        }
    }

    async getCartQuantity(cartId) {
        try {
            const cart = await cartModel.findById(cartId);

            if (cart) {

                const totalQuantity = cart.products.reduce((total, product) => total + product.quantity, 0);
                return totalQuantity;
            } else {
                return null;
            }
        } catch (err) {
            return err.message
        }
    }

    async processPurchase(cartId, ticketId) {
        try {

            const cart = await cartModel.findById(cartId).populate('products.product');

            if (!cart) {
                throw new Error('No se encuentra el carrito');
            }

            const ticket = await ticketModel.findById(ticketId);

            if (!ticket) {
                throw new Error('No se encuentra el ticket');
            }

            const ticketItems = [];
            let totalAmount = 0;
            const unprocessedProducts = [];
            const allProductsOutOfStock = cart.products.every(cartProduct => cartProduct.product.stock === 0);

            for (const cartProduct of cart.products) {
                const { product, quantity } = cartProduct;

                if (quantity <= product.stock) {
                    const itemAmount = product.price * quantity;
                    ticketItems.push({ product: product._id, quantity, price: product.price });
                    totalAmount += itemAmount;
                    product.stock -= quantity;
                    await product.save();
                } else {
                    const remainingQuantity = product.stock;
                    const itemAmount = product.price * remainingQuantity;
                    ticketItems.push({ product: product._id, quantity: remainingQuantity, price: product.price });
                    totalAmount += itemAmount;
                    product.stock = 0;
                    await product.save();
                    cartProduct.quantity -= remainingQuantity;
                    unprocessedProducts.push(cartProduct);
                }
            }

            if (ticketItems.length === 0 || allProductsOutOfStock) {
                return { success: false, message: 'No hay productos para procesar en la compra' };
            }

            cart.products = unprocessedProducts;
            await cart.save();

            const filteredTicketItems = ticketItems.filter(item => item.quantity > 0);

            const totalQuantity = filteredTicketItems.reduce((total, item) => total + item.quantity, 0);

            ticket.purchase_datetime = new Date();
            ticket.amount = totalAmount;
            ticket.total = totalAmount;
            ticket.totalQuantity = totalQuantity;
            ticket.products = filteredTicketItems.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));
            await ticket.save();

            return { success: true, message: 'Compra procesada exitosamente', ticketId: ticket._id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}