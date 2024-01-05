import productModel from '../models/productSchema.js'
import mongoose from 'mongoose';

export class ProductController {
    constructor() {
    }


    async addProduct(product) {
        try {
            await productModel.create(product)
            return "Producto agregado"
        } catch (err) {
            return err.message
        }
    }

    async getProducts() {
        try {
            const products = await productModel.find().lean()
            return products
        } catch (err) {
            return err.message
        }

    }

    async getProductById(productId) {
        try {
            const product = await productModel.findById(productId)
            return product === null ? 'No se encuentra el producto' : product
        } catch (err) {
            return err.message
        }
    }

    async updateProduct(id, newContent) {
        try {
            const procedure = await productModel.findByIdAndUpdate(id, newContent)
            return procedure
        } catch (err) {
            return err.message
        }
    }

    async deleteProduct(id) {
        try {
            const procedure = await productModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }

    async paginate(filter, options) {
        try {
            return await productModel.paginate(filter, options);
        } catch (err) {
            return err.message;
        }
    }
}
