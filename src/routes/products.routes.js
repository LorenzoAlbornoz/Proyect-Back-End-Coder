import { Router } from 'express'
import { uploader } from '../uploader.js'
import { ProductController } from '../controllers/productControllers.js'
import cloudinary from 'cloudinary'
import { authToken } from '../utils.js'
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
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
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

router.get('/products/category', async (req, res) => {
  try {
    const { categoryName } = req.query;
    const filteredProducts = await controller.getProductsByCategory(categoryName);
    res.status(200).send({ status: 'OK', products: filteredProducts });
  } catch (err) {
    res.status(500).send({ status: 'ERR', data: err.message });
  }
});

router.get('/product/:id', async (req, res) => {
  try {
    const product = await controller.getProductById(req.params.id);
    res.status(200).send({ status: 'OK', product })
  } catch (err) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.post('/product', authToken, handlePolicies(['admin']), uploader.array('images', 5), async (req, res) => {
  try {
    const images = req.files.map((file) => file.path);

    const { title, description, price, category, code, stock } = req.body;
    if (!title || !description || !price || !category || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Cloudinary upload para todas las imágenes
    const cloudImages = await Promise.all(images.map((image) => cloudinary.uploader.upload(image)));

    const newContent = {
      title,
      description,
      price,
      category,
      images: cloudImages.map((img) => img.secure_url),
      code,
      stock,
    };

    const result = await controller.addProduct(newContent);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
});

router.put('/product/:id', authToken, handlePolicies(['admin']), uploader.array('images', 5), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si se enviaron nuevos archivos
    const imageFiles = req.files;

    const { title, description, price, category, code, stock, isFeatured, isOffer } = req.body;

    if (!title || !description || !price || !category || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Si hay nuevos archivos, realizar la carga a Cloudinary para todas las imágenes
    let cloudImages;
    if (imageFiles) {
      cloudImages = await Promise.all(imageFiles.map((file) => cloudinary.uploader.upload(file.path)));
    }

    // Obtener el producto existente
    const existingProduct = await controller.getProductById(id);

    // Eliminar las imágenes antiguas de Cloudinary
    if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
      await Promise.all(existingProduct.images.map((img) => {
        const publicId = img.split('/').pop().replace(/\.[^/.]+$/, '');
        return cloudinary.uploader.destroy(publicId);
      }));
    }

    // Crear el objeto actualizado del producto
    const updatedProduct = {
      title,
      description,
      price,
      category,
      // Si hay nuevas imágenes, usar las URL seguras proporcionadas por Cloudinary
      images: cloudImages ? cloudImages.map((img) => img.secure_url) : existingProduct.images,
      code,
      stock,
      isFeatured: isFeatured || existingProduct.isFeatured, // Usar el valor existente si no se proporciona uno nuevo
      isOffer: isOffer || existingProduct.isOffer, // Usar el valor existente si no se proporciona uno nuevo
    };

    // Actualizar el producto
    const product = await controller.updateProduct(id, updatedProduct, { new: true });
    res.status(200).send({ status: 'OK', data: product });
  } catch (error) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
});

router.put('/product/featured/:id', authToken, handlePolicies(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await controller.toggleProductFeaturedStatus(id);
    res.json(product);
  } catch (error) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.put('/product/offer/:id', authToken, handlePolicies(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await controller.toggleProductOfferStatus(id);
    res.json(product);
  } catch (error) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})


router.delete('/product/:id', authToken, handlePolicies(['admin']), async (req, res) => {
  try {
    const product = await controller.deleteProduct(req.params.id);
    res.status(200).send({ status: 'OK', data: product })
  } catch (err) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.get('/mockingProducts/:qty([1-9]*)', async (req, res) => {
  try {
    const products = await controller.mockingProducts(req.params.qty);
    res.status(200).send({ status: 'OK', data: products })
  } catch (err) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})



export default router