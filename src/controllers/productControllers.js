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

    async getProductsByCategory(categoryName) {
        try {
            return await productService.getProductsByCategory(categoryName)
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

    async mockingProducts(qty) {
        try {
            return await productService.mockingProducts(qty)
        } catch (err) {
            return err.message
        }
    }

    async searchProductsByName(productName) {
        try {
            return await productService.searchProductsByName(productName)
        } catch (err) {
            return err.message
        }
    }

    async toggleProductFeaturedStatus(id) {
        try {
            return await productService.toggleProductFeaturedStatus(id)
        } catch (err) {
            return err.message
        }
    }

    async toggleProductOfferStatus(id) {
        try {
            return await productService.toggleProductOfferStatus(id)
        } catch (err) {
            return err.message;
        }
    }
}
