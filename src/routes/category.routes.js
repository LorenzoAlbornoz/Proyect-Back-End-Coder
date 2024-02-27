import { Router } from 'express'
import { uploader } from '../uploader.js'
import cloudinary from 'cloudinary'
import { CategoryController } from '../controllers/categoryControllers.js'
import categoryModel from '../models/categorySchema.js'

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

router.post('/category', uploader.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ status: 'ERR', data: 'Falta el nombre de la categoria' });
    }

    // Cloudinary upload
    const cloudImg = await cloudinary.uploader.upload(req.file.path);

    const newContent = {
      name,
      image: cloudImg.secure_url,
    };

    const result = await categoryController.createCategory(newContent);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    res.status(500).json({ status: "ERR", data: err.message });
  }
});

router.put('/category/:id', uploader.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Verificar si la categoría existe
    const existingCategory = await categoryModel.findById(id);
    if (!existingCategory) {
      return res.status(404).send({ status: 'ERR', data: 'La categoría no fue encontrada' });
    }

    let updatedCategory;

    // Verificar si se proporcionó una nueva imagen
    if (req.file) {
      // Cloudinary upload
      const cloudImg = await cloudinary.uploader.upload(req.file.path);

      updatedCategory = {
        name,
        image: cloudImg.secure_url,
      };
    }

    const category = await categoryController.updateCategory(id, updatedCategory, { new: true });
    res.status(200).send({ status: 'OK', category });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'ERR', data: 'Hubo un error en el servidor' });
  }
});



router.delete('/category/:id', async (req, res) => {
  try {
    const category = await categoryController.deleteCategory(req.params.id);
    res.status(200).send({ status: 'OK', data: category })
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
})

export default router