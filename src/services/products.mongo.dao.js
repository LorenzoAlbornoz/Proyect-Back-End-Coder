import productModel from '../models/productSchema.js'
import cloudinary from 'cloudinary'
import { faker } from '@faker-js/faker';

export class ProductService {
    constructor() {
    }

    async addProduct(product) {
        try {
            const products = await productModel.create(product);
            return products 
        } catch (err) {
            return err.message;
        }
    }

    async getProductsByCategory(categoryName) {
        try {
            const query = productModel.find();
    
            if (categoryName) {
                query.populate({
                    path: 'category',
                    match: { name: categoryName }
                });
            } else {
                query.populate('category');
            }
    
            const products = await query.exec();
    
            // Filtrar productos después de la consulta basada en la categoría
            const filteredProducts = categoryName
                ? products.filter(product => product.category && product.category.name === categoryName)
                : products;
    
            return filteredProducts;
        } catch (err) {
            return err.message;
        }
    }    
    
    async getProducts() {
        try {
            const products = await productModel.find().populate("category")
            return products
        } catch (err) {
            return err.message
        }
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id).populate("category")
            return product === null ? 'No se encuentra el producto' : product
        } catch (err) {
            return err.message
        }
    }

    async updateProduct(id, newContent) {
        try {
          // Obtener el producto antes de la actualización para acceder a las URLs de las imágenes
          const product = await productModel.findById(id);
      
          // Console.log para las URLs de las imágenes antes de la actualización
          console.log('URLs de las imágenes antes de la actualización:', product.images);
      
          // Verificar si se proporcionan nuevas imágenes en la actualización
          if (newContent.images && newContent.images.length > 0) {
            // Actualizar el producto en la base de datos con las nuevas imágenes
            const updatedProduct = await productModel.findByIdAndUpdate(id, newContent, { new: true });
      
            // Verificar si el producto original tenía URLs de imágenes
            if (product && product.images && product.images.length > 0) {
              // Extraer los public_id de las URLs de las imágenes en Cloudinary
              const publicIds = product.images.map(url =>
                url.split('/').pop().replace(/\.[^/.]+$/, '')
              );
      
              // Eliminar las imágenes antiguas de Cloudinary
              await Promise.all(publicIds.map(publicId =>
                cloudinary.uploader.destroy(publicId)
              ));
            }
      
            // Console.log para el resultado de la actualización en la base de datos
            console.log('Resultado de la actualización en la base de datos:', updatedProduct);
      
            return updatedProduct;
          } else {
            // Si no se proporcionan nuevas imágenes, incluir las imágenes existentes en el objeto newContent
            newContent.images = product.images || [];
      
            // Actualizar el producto sin eliminar las imágenes antiguas
            const updatedProductWithoutImages = await productModel.findByIdAndUpdate(id, newContent, { new: true });
      
            // Console.log para el resultado de la actualización en la base de datos
            console.log('Resultado de la actualización en la base de datos:', updatedProductWithoutImages);
      
            return updatedProductWithoutImages;
          }
        } catch (err) {
          // Console.log para manejar errores
          console.error('Error en la actualización:', err.message);
          return err.message;
        }
      }
      
      async deleteProduct(id) {
        try {
            // Obtener el producto antes de eliminarlo para acceder a las URLs de las imágenes
            const product = await productModel.findById(id);
    
            // Console.log para las URLs de las imágenes antes de la eliminación
            console.log('URLs de las imágenes antes de la eliminación:', product.images);
    
            // Eliminar el producto de la base de datos
            const deletedProduct = await productModel.findByIdAndDelete(id);
    
            // Verificar si el producto existe y tiene URLs de imágenes
            if (product && product.images && product.images.length > 0) {
                // Extraer los public_id de las URLs de las imágenes en Cloudinary
                const publicIds = product.images.map(url =>
                    url.split('/').pop().replace(/\.[^/.]+$/, '')
                );
    
                // Eliminar todas las imágenes de Cloudinary
                await Promise.all(publicIds.map(publicId =>
                    cloudinary.uploader.destroy(publicId)
                ));
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

    async mockingProducts(qty) {
        try {
            const mockProducts = [];

            // Generar productos simulados
            for (let i = 0; i < qty; i++) {
                const products = {
                    _id: faker.database.mongodbObjectId(),
                    title: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    price: faker.commerce.price({ min: 1, max: 1000, precision: 0.01 }),
                    category: faker.database.mongodbObjectId(),
                    image: faker.image.imageUrl(),
                    code: faker.random.alphaNumeric(8),
                    stock: faker.number.int({ min: 1, max: 100 }),
                };

                mockProducts.push(products);
            }

            return mockProducts;
        } catch (err) {
            return err.message;
        }
    }

    async searchProductsByName(productName) {
        try {
            // Utiliza la función de búsqueda en tu modelo de productos
            const filteredProducts = await productModel.find({ title: { $regex: productName, $options: 'i' } }).lean();
            return filteredProducts;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async toggleProductFeaturedStatus(id){
        try {
            const product = await productModel.findById(id);
            product.isFeatured = !product.isFeatured; 
            await product.save();
            return product
        } catch (err) {
            return err.message; 
        }
    }

    async toggleProductOfferStatus(id){
        try {
            const product = await productModel.findById(id);
            product.isOffer = !product.isOffer; 
            await product.save();
            return product
        } catch (err) {
            return err.message;
        }
    }

}