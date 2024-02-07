import { Router } from 'express'
import { uploader } from '../uploader.js'
import { ProductController } from '../controllers/productControllers.js'
import cloudinary from 'cloudinary'
import {authToken } from '../utils.js'
import handlePolicies from '../config/policies.auth.js'
import CustomError from '../services/error.custom.class.js'
import config from '../config.js'

const router = Router()
const controller = new ProductController()

router.get('/products', async (req, res) => {
  try {
    const products = await controller.getProducts()
    res.status(200).send({ status: 'OK', data: products })
  } catch (err) {
    return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.get('/product/:id', async (req, res) => {
  try{
  const product = await controller.getProductById(req.params.id);
  res.status(200).send({ status: 'OK', data: product })
} catch (err) {
  return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
}
})

router.post('/product', authToken, handlePolicies(['admin']), uploader.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { title, description, price, code, stock } = req.body;
    if (!title || !description || !price || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Cloudinary upload
    const cloudImg = await cloudinary.uploader.upload(req.file.path);

    const newContent = {
      title,
      description,
      price,
      image: cloudImg.secure_url,
      code,
      stock,
    };
  } catch (err) {
    return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
});


router.put('/product/:id',authToken ,handlePolicies(['admin']) ,uploader.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { title, description, price, code, stock } = req.body;

    if (!title || !description || !price || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Cloudinary upload
    const cloudImg = await cloudinary.uploader.upload(req.file.path);

    const updatedProduct = {
      title,
      description,
      price,
      image: cloudImg.secure_url, // Usa la URL segura proporcionada por Cloudinary
      code,
      stock,
    };

    const product = await controller.updateProduct(id, updatedProduct, { new: true });
    res.status(200).send({ status: 'OK', data: product });
  } catch (error) {
    return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
});

router.delete('/product/:id',authToken ,handlePolicies(['admin']) ,async (req, res) => {
  try{
  const product = await controller.deleteProduct(req.params.id);
  res.status(200).send({ status: 'OK', data: product })
} catch (err) {
  return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
}
})

export default router

