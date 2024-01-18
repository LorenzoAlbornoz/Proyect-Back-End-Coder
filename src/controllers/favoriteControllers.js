import favoriteModel from '../models/favoriteSchema.js';
import userModel from '../models/userSchema.js';

export class FavoriteController {
    constructor() {
    }

    async createFavorite(user) {
        try {
            const newFavorite = {
                products: [],
                user: user._id,
            };
            const createdFavorite = await favoriteModel.create(newFavorite);
            return createdFavorite;
        } catch (error) {
            throw error;
        }
    }

    async getFavoriteById(userId) {
        try {
            // Obtener el usuario por su ID
            const user = await userModel.findById(userId);

            if (!user) {
                return 'No se encuentra el usuario';
            }

            // Obtener el ID del favorito del usuario
            const favoriteId = user.favorite;

            // Buscar el favorito por su ID y populando los productos
            const favorite = await favoriteModel.findById(favoriteId).populate('products.product');

            if (!favorite) {
                return 'No se encuentra el favorito';
            }

            return favorite;
        } catch (err) {
            return err.message;
        }
    }

    async addProductToFavorite(favoriteId, productId) {
        try {
            const favorite = await favoriteModel.findById(favoriteId);

            if (!favorite) {
                return null; // El favorito no existe
            }

            // Verificar si el producto ya está en el favorito
            const existingProduct = favorite.products.find(product => product.product.toString() === productId);

            if (existingProduct) {
                // Si el producto ya está en el favorito, aumentar la cantidad
                existingProduct.quantity += 1;
            } else {
                // Si el producto no está en el favorito, agregarlo con cantidad 1
                const productToAdd = {
                    product: productId,
                    quantity: 1,
                };

                favorite.products.push(productToAdd);
            }
            const updatedFavorite = await favorite.save();
            return updatedFavorite;
        } catch (error) {
            console.error('Error en addProductToFavorite:', error);
            throw error;
        }
    }

    async deleteProductFromFavorite(favoriteId, productId) {
        try {
            const favorite = await favoriteModel.findById(favoriteId);

            if (!favorite) {
                return null; // El favorito no existe
            }

            const updatedProducts = favorite.products.filter(product => product.product.toString() !== productId);

            if (updatedProducts.length < favorite.products.length) {
                // Si se eliminó algún producto, actualiza el favorito
                favorite.products = updatedProducts;
                const updatedFavorite = await favorite.save();
                return updatedFavorite;
            } else {
                res.status(204).send();
                return null; // El producto no estaba en el favorito
            }
        } catch (error) {
            throw error;
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
