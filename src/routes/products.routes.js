import { Router } from 'express'
import { uploader } from '../uploader.js'
import * as productController from "../controllers/productControllers.js";

const {
  getAllProducts,
  getProductByID,
  createProduct,
  deleteProduct,
  updateProduct
} = productController;


const router = Router()

router.get("/products", getAllProducts)
router.get("/product/:_id", getProductByID)
router.post("/product",  uploader.single("image"), createProduct)
router.put("/product/:id", uploader.single('image'),  updateProduct)
router.delete("/product/:id",  deleteProduct)

export default router

