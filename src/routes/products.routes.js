import { Router } from 'express'
import { uploader } from '../uploader.js'
import { ProductController } from '../controllers/productController.js'

const router = Router()
const controller = new ProductController()

router.get('/', async (req, res) => {
    const products = await controller.getProducts()
    res.status(200).send({ status: 'OK', data: products })
})

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await controller.getProductById(id);
    res.status(200).send({ status: 'OK', data: product })
})

router.post('/', uploader.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

    const { title, description, price, code, stock } = req.body
    if (!title || !description || !price || !code || !stock) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
    }

    const newContent = {
        title,
        description,
        price,
        image: req.file.filename,
        code,
        stock
    }

    const result = await controller.addProduct(newContent)
    res.status(200).send({ status: 'OK', data: result })
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

    const { title, description, price, code, stock} = req.body;

    if (!title || !description || !price || !code || !stock) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
    }

    const product = await controller.updateProduct( id,{
        title,
        description,
        price,
        image: req.file.filename,
        code,
        stock
    }, { new: true });
    res.status(200).send({ status: 'OK', data: product })
    })

    router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await controller.deleteProduct(id);
    res.status(200).send({ status: 'OK', data: product })
    })

export default router
