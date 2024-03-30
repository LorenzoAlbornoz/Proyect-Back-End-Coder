import { Router } from 'express'
import { CartController } from '../controllers/cartControllers.js'
import { ProductController } from '../controllers/productControllers.js';
import { authToken } from '../utils.js';
import handlePolicies from '../config/policies.auth.js';

const router = Router()
const controller = new CartController()
const productController = new ProductController()

router.get('/cart/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await controller.getCartById(cartId);

    if (cart) {
      res.send(cart);
    } else {
      res.status(404).json({ error: 'El carrito no existe' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});


router.get('/cart/quantity/:cartId', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const cartQuantity = await controller.getCartQuantity(cartId);

    if (cartQuantity !== null) {
      res.status(200).json({ quantity: cartQuantity });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/cart/:cartId/ticket/:ticketId/purchase', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const ticketId = req.params.ticketId;
    const result = await controller.processPurchase(cartId, ticketId);
    if (result.status === 'OK') {
      res.status(200).send(result);
    } else {
      res.status(500).send(result);
    }
  } catch (err) {
    res.status(500).send({ status: 'ERR', data: err.message });
  }
});

router.post('/cart/:cid/product/:pid', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    // Obtener información del producto antes de agregarlo al carrito
    const productInfo = await productController.getProductById(productId);

    console.log('Role del usuario:', req.user.role);
    console.log('ID del producto:', productId);
    console.log('ID del usuario desde el token:', req.user.sub);
    console.log('ID del dueño del producto:', productInfo.owner);


    // Verificar si el usuario es premium y el producto le pertenece
    if (req.user.role === 'premium' && productInfo.owner.toString() === req.user.sub) {
      return res.status(403).json({ error: 'No puedes agregar tu propio producto al carrito.' });
    }

    // Continuar con la lógica original para agregar el producto al carrito
    const addProductResult = await controller.addProductToCart(cartId, productId);

    if (addProductResult !== null) {
      res.status(201).json({ data: addProductResult });
    } else {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/payment-attempt/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;

    // Llama a la función checkout pasando el ID del carrito
    const result = await controller.checkout(cartId);

    // Verifica el resultado y envía la respuesta apropiada
    if (result.status === 'OK') {
      res.status(200).send(result.data);
    } else {
      res.status(500).send({ status: 'ERR', data: result.data });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud de pago:', error);
    res.status(500).send({ status: 'ERR', data: 'Error al procesar la solicitud de pago' });
  }
});

router.put('/cart/:cartId/product/:productId', async (req, res) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;
  const newQuantity = req.body.quantity;

  try {
    const updatedCart = await controller.editProductQuantity(cartId, productId, newQuantity);

    // Verificar si el producto se actualizó correctamente en el carrito
    if (updatedCart !== null) {
      res.status(200).json({ message: 'Cantidad del producto actualizada exitosamente' });
    } else {
      res.status(404).json({ error: 'El producto no está en el carrito' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
  }
});

router.delete('/cart/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const updatedCart = await controller.deleteProductFromCart(cartId, productId);

    if (updatedCart !== null) {
      res.status(200).json({ data: updatedCart });
    } else {
      res.status(404).json({ error: 'El producto no está en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});

router.delete('/cleanCart/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cleanCart = await controller.clearCart(cartId);
    if (cleanCart !== null) {
      res.status(200).json({ data: cleanCart });
    } else {
      res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router