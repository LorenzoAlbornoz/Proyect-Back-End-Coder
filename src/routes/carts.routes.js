import { Router } from 'express'
import * as cartController from "../controllers/cartControllers.js";

const {
  getCartById,
  createCart,
  addProductToCart,
  editProductQuantity,
  deleteProductFromCart,
  deleteCart
} = cartController;

const router = Router()

router.get('/cart/:cid', getCartById)
router.post('/cart', createCart)
router.post('/cart/:cid/product/:pid', addProductToCart)
router.put('/cart/:cid/product/:pid', editProductQuantity)
router.delete('/cart/:cid/product/:pid', deleteProductFromCart)
router.delete('/cart/:id', deleteCart)

export default router

