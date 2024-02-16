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
    res.status(200).send({ status: 'OK', products })
  } catch (err) {
    return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.get('/products/search', async (req, res) => {
  try {
    const { productName } = req.query;
    const filteredProducts = await controller.searchProductsByName(productName);
    res.status(200).send({ status: 'OK', products: filteredProducts });
  } catch (err) {
    res.status(500).send({ status: 'ERR', data: err.message });
  }
});


router.get('/product/:id', async (req, res) => {
  try{
  const product = await controller.getProductById(req.params.id);
  res.status(200).send({ status: 'OK', product })
} catch (err) {
  return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
}
})

router.post('/product', authToken, handlePolicies(['admin']), uploader.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { title, description, price, category, code, stock } = req.body;
    if (!title || !description || !price || !category || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Cloudinary upload
    const cloudImg = await cloudinary.uploader.upload(req.file.path);

    const newContent = {
      title,
      description,
      price,
      category,
      image: cloudImg.secure_url,
      code,
      stock,
    };

    const result = await controller.addProduct(newContent);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    return next (new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
});


router.put('/product/:id',authToken ,handlePolicies(['admin']) ,uploader.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si se envió un nuevo archivo
    const imageFile = req.file;

    const { title, description, price, category, code, stock } = req.body;

    if (!title || !description || !price || !category || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Si hay un nuevo archivo, realizar la carga a Cloudinary
    let cloudImg;
    if (imageFile) {
      cloudImg = await cloudinary.uploader.upload(imageFile.path);
    }

    // Crear el objeto actualizado del producto
    const updatedProduct = {
      title,
      description,
      price,
      category,
      // Si hay una nueva imagen, usar la URL segura proporcionada por Cloudinary
      image: cloudImg ? cloudImg.secure_url : undefined,
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

router.get('/mockingProducts/:qty([1-9]*)', async (req, res) => {
  try{
  const products = await controller.mockingProducts(req.params.qty);
  res.status(200).send({status: 'OK', data: products})
} catch (err) {
  return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
}
})



export default router

