import { Router } from 'express'
import { uploader } from '../uploader.js'
import { ProductController } from '../controllers/productControllers.js'
import cloudinary from 'cloudinary'
import { handlePolicies, authToken } from '../utils.js'


const router = Router()
const controller = new ProductController()

router.get('/products', async (req, res) => {
  try {
    const products = await controller.getProducts()
    res.status(200).send({ status: 'OK', data: products })
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
})

router.get('/product/:id', async (req, res) => {
  try{
  const product = await controller.getProductById(req.params.id);
  res.status(200).send({ status: 'OK', data: product })
} catch (err) {
  res.status(500).send({ status: "ERR", data: err.message });
}
})

router.post('/product',authToken ,handlePolicies(['admin']) ,uploader.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { title, description, price, code, stock } = req.body;
    if (!title || !description || !price || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
    }

    // Cloudinary upload
    const cloudImg = await cloudinary.uploader.upload(req.file.path);

    const newContent = {
      title,
      description,
      price,
      image: cloudImg.secure_url, // Usa la URL segura proporcionada por Cloudinary
      code,
      stock,
    };

    const result = await controller.addProduct(newContent);
    res.status(200).send({ status: 'OK', data: result });
  } catch (err) {
    res.status(500).send({ status: 'ERR', data: 'Hubo un error en el servidor' });
  }
});

router.put('/product/:id',authToken ,handlePolicies(['admin']) ,uploader.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' });

    const { title, description, price, code, stock } = req.body;

    if (!title || !description || !price || !code || !stock) {
      return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
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
    console.error(error);
    res.status(500).send({ status: 'ERR', data: 'Hubo un error en el servidor' });
  }
});

router.delete('/product/:id',authToken ,handlePolicies(['admin']) ,async (req, res) => {
  try{
  const product = await controller.deleteProduct(req.params.id);
  res.status(200).send({ status: 'OK', data: product })
} catch (err) {
  res.status(500).send({ status: "ERR", data: err.message });
}
})

export default router

