import { Router } from 'express'
import * as categoryController from "../controllers/categoryControllers.js";

const {
 getAllCategories,
 createCategory,
 deleteCategory
} = categoryController;

const router = Router()

router.get("/categories", getAllCategories)
router.post("/category", createCategory)
router.delete("/category/:id", deleteCategory)

export default router