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
            const product = await productModel.findById(id);

            if (newContent.images && newContent.images.length > 0) {

                const updatedProduct = await productModel.findByIdAndUpdate(id, newContent, { new: true });

                if (product && product.images && product.images.length > 0) {

                    const publicIds = product.images.map(url =>
                        url.split('/').pop().replace(/\.[^/.]+$/, '')
                    );

                    await Promise.all(publicIds.map(publicId =>
                        cloudinary.uploader.destroy(publicId)
                    ));
                }

                return updatedProduct;
            } else {

                newContent.images = product.images || [];

                const updatedProductWithoutImages = await productModel.findByIdAndUpdate(id, newContent, { new: true });

                return updatedProductWithoutImages;
            }
        } catch (err) {
            return err.message;
        }
    }

    async deleteProduct(id) {
        try {
            const product = await productModel.findById(id);

            const deletedProduct = await productModel.findByIdAndDelete(id);

            if (product && product.images && product.images.length > 0) {

                const publicIds = product.images.map(url =>
                    url.split('/').pop().replace(/\.[^/.]+$/, '')
                );

                await Promise.all(publicIds.map(publicId =>
                    cloudinary.uploader.destroy(publicId)
                ));
            }

            return deletedProduct;
        } catch (err) {
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
            const filteredProducts = await productModel.find({ title: { $regex: productName, $options: 'i' } }).lean();
            return filteredProducts;
        } catch (err) {
            return err.message;
        }
    }

    async toggleProductFeaturedStatus(id) {
        try {
            const product = await productModel.findById(id);
            product.isFeatured = !product.isFeatured;
            await product.save();
            return product
        } catch (err) {
            return err.message;
        }
    }

    async toggleProductOfferStatus(id) {
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