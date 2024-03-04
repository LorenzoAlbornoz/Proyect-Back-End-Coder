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

router.post('/product', authToken, handlePolicies(['admin', 'premium']), uploader.array('images', 5), async (req, res, next) => {
  try {
    const images = req.files.map((file) => file.path);

    const { title, description, price, category, code, stock } = req.body;
    if (!title || !description || !price || !category || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    // Cloudinary upload para todas las imágenes
    const cloudImages = await Promise.all(images.map((image) => cloudinary.uploader.upload(image)));

    const ownerId = req.user.sub

    const newContent = {
      title,
      description,
      price,
      category,
      images: cloudImages.map((img) => img.secure_url),
      code,
      stock,
      owner: ownerId,
    };

    const result = await controller.addProduct(newContent);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    console.error('Error al crear el producto:', err);
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR));
  }
});


router.put('/product/:id', authToken, handlePolicies(['admin', 'premium']), uploader.array('images', 5), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { files, body: { title, description, price, category, code, stock, isFeatured, isOffer } } = req;

    if (![title, description, price, category, code, stock].every(Boolean)) {
      return res.status(400).send({ status: 'ERR', data: config.errorsDictionary.FEW_PARAMETERS });
    }

    const cloudImages = files && await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path)));
    const existingProduct = await controller.getProductById(id);

    if (req.user.role === 'premium' && req.user.sub !== existingProduct.owner.toString()) {
      return res.status(403).send({ status: 'ERR', data: 'No tienes permisos para modificar este producto.' });
    }

    const ownerId = req.user.sub;

    const updatedProduct = {
      title,
      description,
      price,
      category,
      images: cloudImages ? cloudImages.map((img) => img.secure_url) : existingProduct.images,
      code,
      stock,
      isFeatured: isFeatured || existingProduct.isFeatured,
      isOffer: isOffer || existingProduct.isOffer,
      owner: ownerId,
    };

    const product = await controller.updateProduct(id, updatedProduct, { new: true });
    res.status(200).send({ status: 'OK', data: product });
  } catch (error) {
    // Aquí, si hay un error, puedes enviar un mensaje de error específico al cliente
    res.status(500).send({ status: 'ERR', data: 'Hubo un error al modificar el producto. Puede que este producto no sea de tu propiedad.' });
  }
});


router.put('/product/featured/:id', authToken, handlePolicies(['admin', 'premium']), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await controller.toggleProductFeaturedStatus(id);
    res.json(product);
  } catch (error) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.put('/product/offer/:id', authToken, handlePolicies(['admin', 'premium']), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await controller.toggleProductOfferStatus(id);
    res.json(product);
  } catch (error) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})

router.delete('/product/:id', authToken, handlePolicies(['admin', 'premium']), async (req, res, next) => {
  try {
    const productId = req.params.id;
    const existingProduct = await controller.getProductById(productId);

    if (req.user.role === 'premium' && req.user.sub !== existingProduct.owner?.toString()) {
      console.log('Usuario premium intentó borrar un producto que no le pertenece.');
      return res.status(403).send({ status: 'ERR', data: 'No tienes permisos para borrar este producto.' });
    }

    const result = await controller.deleteProduct(productId);
    console.log('Producto eliminado con éxito:', result);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    console.error('Error al intentar eliminar el producto:', err);
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR));
  }
});

router.get('/mockingProducts/:qty([1-9]*)', async (req, res) => {
  try {
    const products = await controller.mockingProducts(req.params.qty);
    res.status(200).send({ status: 'OK', data: products })
  } catch (err) {
    return next(new CustomError(config.errorsDictionary.INTERNAL_ERROR))
  }
})



export default router