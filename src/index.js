import express from 'express'
import ProductManager from '../ProductManager.js'

const PORT = 8080;

const app = express();
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager('./products.json');

app.get('/products', async (req, res) => {
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

app.get('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
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


app.listen(PORT, () => {
    console.log(`Servidor express activo en puerto ${PORT}`);
});

