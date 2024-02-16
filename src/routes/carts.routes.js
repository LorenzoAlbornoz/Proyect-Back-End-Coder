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

router.get('/cart/quantity/:cartId', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const cartQuantity = await controller.getCartQuantity(cartId);

    if (cartQuantity !== null) {
      res.json({ quantity: cartQuantity });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/cart/:cartId/user/:userId/purchase', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const userId = req.params.userId;
    const result = await controller.processPurchase(cartId, userId); 
    if (result.status === 'OK') {
      res.status(200).send(result);
    } else {
      res.status(500).send(result);
    }
  } catch (err) {
    res.status(500).send({ status: 'ERR', data: err.message });
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

router.put('/cart/:cartId/product/:productId',  async (req, res) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;
  const newQuantity = req.body.quantity;

  try {
    const updatedCart = await controller.editProductQuantity(cartId, productId, newQuantity);

    // Verificar si el producto se actualizó correctamente en el carrito
    if (updatedCart !== null) {
      res.json({ message: 'Cantidad del producto actualizada exitosamente' });
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

export default router