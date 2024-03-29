import cartModel from '../models/cartSchema.js'
import userModel from '../models/userSchema.js';
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
            // Buscar el carrito por su ID y populando los productos
            const cart = await cartModel.findById(cartId).populate('products.product');

            if (!cart) {
                return 'No se encuentra el carrito';
            }

            // Calcular el total sumando el precio de cada producto multiplicado por su cantidad
            const total = cart.products.reduce((acc, product) => {
                return acc + (product.product.price * product.quantity);
            }, 0);

            // Calcular la cantidad total de productos sumando las cantidades de cada producto
            const totalQuantity = cart.products.reduce((acc, product) => {
                return acc + product.quantity;
            }, 0);

            // Agregar las propiedades 'total' y 'totalQuantity' al objeto cart
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
                return null; // El carrito no existe
            }

            const product = await productModel.findById(productId);
            
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
                    currency:'usd',
                    unit_amount: Math.round(product.price * 100), // Convertir el precio a centavos
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
            // Verificar si newQuantity es un número positivo
            newQuantity = parseInt(newQuantity);

            if (isNaN(newQuantity) || newQuantity < 0) {
                throw new Error('La nueva cantidad debe ser un número positivo');
            }

            // Obtener el carrito por ID
            const cart = await cartModel.findById(cartId);

            if (!cart) {
                throw new Error('El carrito no existe');
            }

            // Buscar el índice del producto en el carrito
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {
                // Actualizar la cantidad del producto si se encuentra en el carrito

                cart.products[productIndex].quantity = newQuantity;

                // Guardar el carrito actualizado
                const updatedCart = await cart.save();

                return updatedCart;
            } else {
                throw new Error('El producto no está en el carrito');
            }
        } catch (err) {
            console.error(err);
            throw new Error('Error al actualizar la cantidad del producto en el carrito');
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
                return null; // El producto no estaba en el carrito
            }
        } catch (err) {
            return err.message
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await cartModel.findById(cartId);
    
            if (!cart) {
                return null; // El carrito no existe
            }
    
            // Establece el array de productos del carrito como un array vacío
            cart.products = [];
    
            // Guarda y devuelve el carrito actualizado
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
                // Sumar las cantidades de todos los productos en el carrito
                const totalQuantity = cart.products.reduce((total, product) => total + product.quantity, 0);
                return totalQuantity;
            } else {
                return null; // Cart no encontrado
            }
        } catch (err) {
            return err.message
        }
    }

    async processPurchase(cartId, userId) {
        let ticket;
    
        try {
            const user = await userModel.findById(userId);
    
            if (!user) {
                throw new Error('No se encuentra el usuario');
            }
    
            const cart = await cartModel.findById(cartId).populate('products.product');
    
            if (!cart) {
                throw new Error('No se encuentra el carrito');
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
    
        // Filtrar los productos que tienen stock igual a 0
        const filteredTicketItems = ticketItems.filter(item => item.quantity > 0);

        // Calcular totalQuantity
        const totalQuantity = filteredTicketItems.reduce((total, item) => total + item.quantity, 0);

        // Crear el ticket con todos los campos y los productos filtrados
        const ticket = await ticketModel.create({
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: user._id,
            products: filteredTicketItems.map(item => ({
                product: item.product,
                quantity: item.quantity
            })),
            total: totalAmount,
            totalQuantity: totalQuantity,
        });

            return { success: true, message: 'Compra procesada exitosamente', ticketId: ticket };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }     
}