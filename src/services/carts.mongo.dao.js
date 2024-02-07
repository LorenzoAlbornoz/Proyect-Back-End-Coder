import cartModel from '../models/cartSchema.js'
import userModel from '../models/userSchema.js';
import productModel from '../models/productSchema.js'
import ticketModel from '../models/ticketSchema.js'

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
    async getCartById(userId) {
        try {
            // Obtener el usuario por su ID
            const user = await userModel.findById(userId);

            if (!user) {
                return 'No se encuentra el usuario';
            }

            // Obtener el ID del carrito del usuario
            const cartId = user.cart;

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
        } catch (err) {
            return err.message;
        }
    }

    async editProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await cartModel.findById(cartId);

            if (!cart) {
                return null; // El carrito no existe
            }
            const productIndex = cart.products.findIndex(product => product._id.toString() === productId);

            if (productIndex !== -1) {
                // Si se encuentra el producto en el carrito, actualiza la cantidad
                cart.products[productIndex].quantity = newQuantity;
                const updatedCart = await cart.save();
                return updatedCart;
            } else {
                return null; // El producto no está en el carrito
            }
        } catch (err) {
            return err.message
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
        } catch (err) {
            return err.message
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

    async processPurchase(userId) {
            try {
                const user = await userModel.findById(userId);
        
                if (!user) {
                    throw new Error('No se encuentra el usuario');
                }
        
                const { cart: cartId } = user;
                const cart = await cartModel.findById(cartId).populate('products.product');
        
                if (!cart) {
                    throw new Error('No se encuentra el carrito');
                }
        
                const ticketItems = [];
                let totalAmount = 0;
        
                // Iterar sobre los productos del carrito
                for (const cartProduct of cart.products) {
                    const { product, quantity } = cartProduct;
        
                    if (quantity <= product.stock) {
                        // Suficiente stock para la cantidad deseada
                        const itemAmount = product.price * quantity;
        
                        ticketItems.push({ product: product._id, quantity, price: product.price });
                        totalAmount += itemAmount;
        
                        // Descontar el stock utilizando quantity
                        product.stock -= quantity;
                        await product.save();
                    } else {
                        // Reducir el stock en la cantidad disponible en stock
                        const remainingQuantity = product.stock;
        
                        const itemAmount = product.price * remainingQuantity;
        
                        ticketItems.push({ product: product._id, quantity: remainingQuantity, price: product.price });
                        totalAmount += itemAmount;
        
                        // Descontar el stock utilizando remainingQuantity
                        product.stock = 0;
                        await product.save();
        
                        // Actualizar la cantidad en el carrito después de la compra
                        cartProduct.quantity -= remainingQuantity;
                    }
                }
        
                // Filtrar los productos que no pudieron comprarse completamente
                cart.products = cart.products.filter(cartProduct => {
                    const { quantity } = cartProduct;
                    return quantity > 0; // Incluir en el carrito si la cantidad es mayor que 0
                });
        
                await cart.save();
        
                const ticket = await ticketModel.create({
                    purchase_datetime: new Date(),
                    amount: totalAmount,
                    purchaser: user._id,
                    items: ticketItems,
                });
        
                return { success: true, message: 'Compra procesada exitosamente', ticketId: ticket._id };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
}