import {Router} from 'express'
import ProductManager from '../../ProductManager.js'

const router = Router()

const productManager = new ProductManager('./products.json');

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('index', { products });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/newproduct', (req, res) => {
    res.render('newProduct', {
      title: 'Producto creado!'
  })
  })

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {
        title: 'Productos'
    })
  })

export default router