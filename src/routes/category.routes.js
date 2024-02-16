import {Router} from 'express'
import {CategoryController} from '../controllers/categoryControllers.js'

const router = Router()
const categoryController = new CategoryController()

router.get('/categories', async (req, res) => {
    try {
      const categories = await categoryController.getCategories()
      res.status(200).send({ status: 'OK', categories })
    } catch (err) {
      res.status(500).send({ status: "ERR", data: err.message });
    }
  })

router.get('/category/:id', async (req, res) => {
    try {
      const category = await categoryController.getCategoryById(req.params.id);
      res.status(200).send({ status: 'OK', data: category })
    } catch (err) {
        res.status(500).send({ status: "ERR", data: err.message });
      }
  });

  router.post('/category', async (req, res) => {
    try {
        const categoryName = req.body.name;

        if (!categoryName) {
            return res.status(400).json({ status: "ERR", message: "El campo 'name' es obligatorio." });
        }

        const newCategory = await categoryController.createCategory({ name: categoryName });
        res.status(201).json({ status: "OK", data: newCategory });
    } catch (err) {
        res.status(500).json({ status: "ERR", data: err.message });
    }
});


  router.delete('/category/:id', async (req, res) => {
    try{
    const category = await categoryController.deleteCategory(req.params.id);
    res.status(200).send({ status: 'OK', data: category })
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
  })

export default router