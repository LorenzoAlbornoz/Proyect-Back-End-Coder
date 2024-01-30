import { ProductService } from "../services/products.mongo.dao.js"

const productService = new ProductService();

export class ProductController {
    constructor() {
    }
    
    async getProducts() {
        try {
            return await productService.getProducts()
        } catch (err) {
            return err.message
        }
    }
    
    async getProductById(id) {
        try {
            return await productService.getProductById(id)
        } catch (err) {
            return err.message
        }
    }

    async addProduct(product) {
        try {
            return await productService.addProduct(product);
        } catch (err) {
            return err.message
        }
    }

    async updateProduct(id, newContent) {
        try {
            return await productService.updateProduct(id, newContent)
        } catch (err) {
            return err.message
        }
    }

    async deleteProduct(id) {
        try {
            return await productService.deleteProduct(id)
        } catch (err) {
            return err.message
        }
    }

    async paginate(filter, options) {
        try {
            return await productService.paginate(filter, options);
        } catch (err) {
            return err.message;
        }
    }
}
