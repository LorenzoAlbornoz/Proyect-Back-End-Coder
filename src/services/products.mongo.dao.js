import productModel from '../models/productSchema.js'
import cloudinary from 'cloudinary'

export class ProductService {
    constructor() {
    }

    async addProduct(product) {
        try {
            const products = await productModel.create(product);
            return products === null ? 'No se pudo crear el producto' : 'Producto creado';
        } catch (err) {
            return err.message;
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

    async getProductById(id) {
        try {
            const product = await productModel.findById(id)
            return product === null ? 'No se encuentra el producto' : product
        } catch (err) {
            return err.message
        }
    }

    async updateProduct(id, newContent) {
        try {
            // Obtener el producto antes de la actualización para acceder a la URL de la imagen
            const product = await productModel.findById(id);
    
            // Console.log para la URL de la imagen antes de la actualización
            console.log('URL de la imagen antes de la actualización:', product.image);
    
            // Actualizar el producto en la base de datos
            const updatedProduct = await productModel.findByIdAndUpdate(id, newContent, { new: true });
    
            // Verificar si el producto original tenía una URL de imagen
            if (product && product.image) {
                // Extraer el public_id de la URL de la imagen en Cloudinary
                const publicId = product.image.split('/').pop().replace(/\.[^/.]+$/, '');
    
                // Eliminar la imagen antigua de Cloudinary
                await cloudinary.uploader.destroy(publicId);
            }
    
            // Console.log para el resultado de la actualización en la base de datos
            console.log('Resultado de la actualización en la base de datos:', updatedProduct);
    
            return updatedProduct;
        } catch (err) {
            // Console.log para manejar errores
            console.error('Error en la actualización:', err.message);
            return err.message;
        }
    }
    
    async deleteProduct(id) {
        try {
            // Obtener el producto antes de eliminarlo para acceder a la URL de la imagen
            const product = await productModel.findById(id);
    
            // Console.log para la URL de la imagen antes de la eliminación
            console.log('URL de la imagen antes de la eliminación:', product.image);
    
            // Eliminar el producto de la base de datos
            const deletedProduct = await productModel.findByIdAndDelete(id);
    
            // Verificar si el producto existe y tiene una URL de imagen
            if (product && product.image) {
                // Extraer el public_id de la URL de la imagen en Cloudinary
                const publicId = product.image.split('/').pop().replace(/\.[^/.]+$/, '');
    
                // Eliminar la imagen de Cloudinary
                await cloudinary.uploader.destroy(publicId);
            }
    
            // Console.log para el resultado de la eliminación en la base de datos
            console.log('Resultado de la eliminación en la base de datos:', deletedProduct);
    
            return deletedProduct;
        } catch (err) {
            // Console.log para manejar errores
            console.error('Error en la eliminación:', err.message);
            return err.message;
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