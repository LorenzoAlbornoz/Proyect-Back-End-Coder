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
    
            const checkoutResult = await this.checkout(cart, user);

            if (checkoutResult.success) {
                // Actualizar carrito y stock
                await this.updateCartAndStock(cart, checkoutResult.productsToPurchase);

                // Generar y guardar el ticket
                const ticket = await this.generateAndSaveTicket(checkoutResult.ticketObject);

                return { success: true, message: 'Compra procesada exitosamente', ticketId: ticket._id };
            } else {
                throw new Error(checkoutResult.error);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async generateAndSaveTicket(ticketObject) {
        try {
            // Utiliza el modelo de ticket para crear y guardar el ticket
            const createdTicket = await ticketModel.create(ticketObject);
            return createdTicket;
        } catch (error) {
            throw new Error('Error al generar y guardar el ticket');
        }
    }

    async checkout(cart, user) {
        try {
            // Utilizar la lógica de getCartById para calcular total y totalQuantity
            const { total } = this.calculateCartTotal(cart);
    
            const productsToPurchase = [];
            const productsToUpdateInCart = [];
    
            // Verificar el stock actualizado producto por producto del carrito
            for (const cartProduct of cart.products) {
                const product = await productModel.findById(cartProduct.product);
    
                if (!product) {
                    return { success: false, error: 'Algunos productos no están disponibles' };
                }
    
                if (cartProduct.quantity <= product.stock) {
                    // Hay suficiente stock para este producto
                    productsToPurchase.push({
                        product: product._id,
                        quantity: cartProduct.quantity,
                        price: product.price,
                    });
                } else {
                    // No hay suficiente stock, actualiza el carrito
                    productsToUpdateInCart.push({
                        productId: product._id,
                        remainingStock: product.stock,
                    });
                }
            }
    
            // Actualizar el carrito con los productos que tienen stock
            await this.updateCartWithRemainingStock(cart, productsToUpdateInCart);
    
            // Generar el objeto del ticket
            const ticketObject = {
                purchase_datetime: new Date(),
                amount: total,
                purchaser: user._id,
            };
    
            return { success: true, productsToPurchase, ticketObject };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async updateCartWithRemainingStock(cart, productsToUpdateInCart) {
        try {
            // Filtrar los productos que tienen stock suficiente y dejar solo los de stock 0 en el carrito
            cart.products = cart.products.filter(product => {
                const productToUpdate = productsToUpdateInCart.find(p => p.productId.toString() === product.product.toString());
                if (productToUpdate) {
                    // Hay información de actualización para este producto
                    if (productToUpdate.remainingStock > 0) {
                        // Mantener solo los productos con stock 0
                        product.quantity = productToUpdate.remainingStock;
                        return true;
                    } else {
                        // Eliminar el producto del carrito si el stock es 0
                        return false;
                    }
                }
                return true; // Mantener los productos con stock suficiente
            });
    
            // Calcular el total y la cantidad total nuevamente
            await cart.calculateTotal();
    
            // Guardar el carrito actualizado
            await cart.save();
    
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
}    
    
    calculateCartTotal(cart) {
   // Calcular el total sumando el precio de cada producto multiplicado por su cantidad
   const total = cart.products.reduce((acc, product) => {
    const productInStock = product.quantity > 0 && product.product.stock > 0;
    if (productInStock) {
        return acc + (product.product.price * product.quantity);
    }
    return acc;
}, 0);
    
        return { total };
    }

    async updateCartAndStock(cart, productsToPurchase) {
        try {
            const productsNotPurchased = [];
    
            // Actualizar el carrito
            for (const productToUpdate of productsToPurchase) {
                const productIndex = cart.products.findIndex(product => product.product.toString() === productToUpdate.product.toString());
    
                if (productIndex !== -1) {
                    // Si se encuentra el producto en el carrito, actualizar la cantidad
                    const updatedQuantity = cart.products[productIndex].quantity - productToUpdate.quantity;
    
                    // Verificar si la actualización agota el stock del producto
                    if (updatedQuantity <= 0) {
                        // Agregar a la lista de productos no comprados
                        productsNotPurchased.push(productToUpdate.product);
                    }
    
                    // Actualizar la cantidad en el carrito
                    cart.products[productIndex].quantity = updatedQuantity;
                }
            }
    
            // Eliminar productos con cantidad cero del carrito
            cart.products = cart.products.filter(product => product.quantity > 0);
    
            // Calcular el total y la cantidad total nuevamente
            await cart.calculateTotal();
    
            // Guardar el carrito actualizado
            await cart.save();
    
            // Actualizar el stock de productos en la base de datos
            await this.updateProductStock(cart.products);
    
            // Devolver el arreglo con los IDs de los productos que no pudieron procesarse
            return { success: true, productsNotPurchased };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async updateProductStock(productsToPurchase) {
        try {
            // Recorrer los productos a comprar y actualizar el stock en la base de datos
            for (const productToPurchase of productsToPurchase) {
                const product = await productModel.findById(productToPurchase.product);
    
                if (product) {
                    // Verificar si el stock del producto es mayor que 0 antes de restar
                    if (product.stock > 0) {
                        // Actualizar el stock restando la cantidad comprada
                        product.stock -= productToPurchase.quantity;
                        await product.save();
                    }
                }
            }
    
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
}