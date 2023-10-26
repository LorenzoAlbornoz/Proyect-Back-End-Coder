import express from 'express'
import ProductManager from './src/index'

const PORT = 8080;

const app = express();
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager();

app.get('/products', async (req, res) => {
    try {
        const limit = req.query.limit;
        const products = await productManager.getProducts(limit);
        if (products) {
            res.send(products);
        } else {
            res.status(404).json({ error: 'Los productos no existen' });
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