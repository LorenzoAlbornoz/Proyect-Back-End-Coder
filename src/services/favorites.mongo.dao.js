import favoriteModel from '../models/favoriteSchema.js';
import userModel from '../models/userSchema.js';

export class FavoriteService {
    constructor() {
    }

    async getFavoriteById(userId) {
        try {
            const user = await userModel.findById(userId);

            if (!user) {
                return 'No se encuentra el usuario';
            }

            const favoriteId = user.favorite;

            const favorite = await favoriteModel.findById(favoriteId).populate('products.product');

            if (!favorite) {
                return 'No se encuentra el favorito';
            }

            return favorite;
        } catch (err) {
            return err.message;
        }
    }

    async createFavorite(user) {
        try {
            const newFavorite = {
                products: [],
                user: user._id,
            };
            const createdFavorite = await favoriteModel.create(newFavorite);
            return createdFavorite;
        } catch (err) {
            return err.message;
        }
    }

    async addProductToFavorite(favoriteId, productId) {
        try {
            const favorite = await favoriteModel.findById(favoriteId);

            if (!favorite) {
                return null;
            }

            const existingProduct = favorite.products.find(product => product.product.toString() === productId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                const productToAdd = {
                    product: productId,
                    quantity: 1,
                };

                favorite.products.push(productToAdd);
            }
            const updatedFavorite = await favorite.save();
            return updatedFavorite;
        } catch (err) {
            return err.message;
        }
    }

    async deleteProductFromFavorite(favoriteId, productId) {
        try {
            const favorite = await favoriteModel.findById(favoriteId);

            if (!favorite) {
                return null;
            }

            const updatedProducts = favorite.products.filter(product => product.product.toString() !== productId);

            if (updatedProducts.length < favorite.products.length) {
                favorite.products = updatedProducts;
                const updatedFavorite = await favorite.save();
                return updatedFavorite;
            } else {
                res.status(204).send();
                return null;
            }
        } catch (err) {
            return err.message
        }
    }

    async deleteFavorite(id) {
        try {
            const procedure = await favoriteModel.findByIdAndDelete(id);
            return procedure;
        } catch (err) {
            return err.message;
        }
    }
}
