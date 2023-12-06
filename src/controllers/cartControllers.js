import cartModel from '../models/cartSchema.js'
import productModel from '../models/productSchema.js'

export const createCart = async (req, res) => {

    try {
        const newCart = {
            products: [],
        };
        const createdCart = await cartModel.create(newCart);
        return res.status(201).json({
            mensaje: "Carrito creado correctamente",
            status: 201,
            createdCart,
        })
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        })
    }
}

export const getCartById = async (req, res) => {
    const {  cid } = req.params;
    console.log('ID recibido:', cid);
    const cart = await cartModel.findById(cid).populate('products.product')
    try {

        if (!cart) {
            return res.status(404).json({
                mensaje: "Carrito no encontrado",
                status: 404,
            });
        }

        return res.status(200).json({
            mensaje: "Carrito encontrado",
            status: 200,
            cart
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const cart = await cartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                mensaje: "El carrito no existe",
                status: 404,
            });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                mensaje: "El producto no existe",
                status: 404,
            });
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
        return res.status(201).json({ data: updatedCart });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        });
    }
};

export const editProductQuantity = async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const newQuantity = req.body.quantity;

    try {
        const cart = await cartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                mensaje: "Carrito no encontrado",
                status: 404,
            });
        }

        const productIndex = cart.products.findIndex(product => product.product.toString() === productId);

        if (productIndex !== -1) {
            // Si se encuentra el producto en el carrito, actualiza la cantidad
            cart.products[productIndex].quantity = newQuantity;
            const updatedCart = await cart.save();
            return res.status(200).json({
                mensaje: "Cantidad de producto actualizada correctamente",
                status: 200,
                cart: updatedCart
            });
        } else {
            return res.status(404).json({
                mensaje: "Producto no encontrado en el carrito",
                status: 404
            });
        }
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        });
    }
}

export const deleteProductFromCart = async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        const cart = await cartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                mensaje: "Carrito no encontrado",
                status: 404,
            });
        }

        const updatedProducts = cart.products.filter(product => product.product.toString() !== productId);

        if (updatedProducts.length < cart.products.length) {
            // Si se eliminó algún producto, actualiza el carrito
            cart.products = updatedProducts;
            const updatedCart = await cart.save();
            return res.status(200).json({
                mensaje: "Producto eliminado del carrito correctamente",
                status: 200,
                cart: updatedCart
            });
        } else {
            return res.status(404).json({
                mensaje: "Producto no encontrado en el carrito",
                status: 404
            });
        }
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
        });
    }
}

export const deleteCart = async (req, res) => {
    const { id } = req.params;
    const cart = await cartModel.findByIdAndDelete(id);
    try {

        if (!cart) {
            return res.status(404).json({
                mensaje: "Carrito no encontrado",
                status: 404,
            });
        }

        return res.status(200).json({
            mensaje: "Carrito borrado correctamente",
            status: 200,
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500,
        });
    }
};