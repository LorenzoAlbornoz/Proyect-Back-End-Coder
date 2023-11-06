import {Router} from 'express'
import CartManager from '../../CartManager.js'

const router = Router()

const cartManager = new CartManager('./carts.json')

router.post('/', async (req, res) => {
  try {
    const newCart = {
      id: cartManager.currentId,
      products:[]
    }
    cartManager.carts.push(newCart)
    await cartManager.newCart(newCart)
    res.status(201).json({data: newCart})
    
  } catch (error) {
    console.error("Error al crear el carrito:", error);
  }
})

router.get('/:cid', async (req,res) => {
  try {
    const cartId = parseInt(req.params.cid, 10)
    const cart = await cartManager.getCart(cartId)
    
    if(cart){
      res.send(cart)
    } else{
      res.status(404).json({error: 'El carrito no existe'})
    }

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
})

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid); 
    const productId = parseInt(req.params.pid); 
    const addProductResult = await cartManager.addProduct(cartId, productId);

    if (addProductResult !== null) {
      res.status(201).json({ data: addProductResult });
    } else {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
    });
  

export default router
