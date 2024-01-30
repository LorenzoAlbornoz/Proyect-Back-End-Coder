import { Router } from 'express'
import { CartController } from '../controllers/cartControllers.js'

const router = Router()
const controller = new CartController()

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

router.post('/cart/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const addProductResult = await controller.addProductToCart(cartId, productId);

  if (addProductResult !== null) {
    res.status(201).json({ data: addProductResult });
  } else {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

router.put('/cart/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const newQuantity = req.body.quantity; // Asegúrate de enviar la nueva cantidad en el cuerpo de la solicitud

  try {
    const updatedCart = await controller.editProductQuantity(cartId, productId, newQuantity);

    if (updatedCart !== null) {
      res.status(200).json({ data: updatedCart });
    } else {
      res.status(404).json({ error: 'El producto no está en el carrito' });
    }
  } catch (error) {
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

export default router