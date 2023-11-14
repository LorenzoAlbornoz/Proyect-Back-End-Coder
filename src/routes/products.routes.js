import { Router } from 'express'
import { uploader } from '../uploader.js'
import ProductManager from '../../ProductManager.js'

const router = Router()

const productManager = new ProductManager('./products.json');

router.get('/', async (req, res) => {
    try {
      const limit = req.query.limit;
      const allProducts = await productManager.getProducts();
  
      if (limit) {
        const limitInt = parseInt(limit);
  
        // numero entero y positivo
        if (!isNaN(limitInt) && limitInt > 0) {
            // seleccionamos solo la cantidad de productos especificados por limit
          const limitedProducts = allProducts.slice(0, limitInt);
          res.send(limitedProducts);
        } else {
          res.status(400).json({ error: 'El parámetro limit debe ser un número entero positivo' });
        }
      } else {
        res.send(allProducts);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  });

router.get('/:pid', async (req, res) => {
    res.render('index', {

    })
    try {
        const productId = (parseInt(req.params.pid))
        const product = await productManager.getProductById(productId);
        if (product) {
            res.send(product);
        } else {
            res.status(404).json({ error: 'El producto no existe' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

router.post('/', uploader.array('fotos', 10), async (req, res) => {
    try {
        const addProduct = req.body;
        const fotos = req.files;
        const nombresFotos = fotos.map((foto) => foto.filename);
        addProduct.fotos = nombresFotos;

        await productManager.addProduct(addProduct);

        res.status(200).send({ data: addProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

router.put('/:id', uploader.single('fotos'), async (req, res) => {
    try {
      const productId = parseInt(req.params.id); 
      console.log(productId)
      const fotos = req.file;
      console.log(fotos)
      const nombreFoto = fotos.originalname; // Usa req.file.filename
      console.log(nombreFoto);
      const updatedProductData = req.body; 
  
      const updatedProduct = await productManager.updateProduct(productId, updatedProductData);
  
      if (updatedProduct) {
        res.status(200).send({ data: updatedProduct });
      } else {
        res.status(404).send({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Error al actualizar el producto', details: error.message });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);

        if (deletedProduct !== null) {
            res.status(200).send({ message: 'Producto eliminado con éxito' });
        } else {
            res.status(404).send({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});
export default router