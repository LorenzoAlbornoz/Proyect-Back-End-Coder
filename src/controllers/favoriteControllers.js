import { FavoriteService } from "../services/favorites.mongo.dao.js";

const favoriteService = new FavoriteService()

export class FavoriteController {
    constructor() {
    }

    async getFavoriteById(id) {
        try {
            return await favoriteService.getFavoriteById(id)
        } catch (err) {
            return err.message;
        }
    }

    async createFavorite(user) {
        try {
            return await favoriteService.createFavorite(user)
        } catch (err) {
            return err.message
        }
    }

    async addProductToFavorite(favoriteId, productId) {
        try {
            return await favoriteService.addProductToFavorite(favoriteId, productId) 
        } catch (err) {
            return err.message
        }
    }

    async deleteProductFromFavorite(favoriteId, productId) {
        try {
            return await favoriteService.deleteProductFromFavorite(favoriteId, productId)
        } catch (err) {
            return err.message
        }
    }

    async deleteFavorite(id) {
        try {
            return await favoriteService.deleteFavorite(id)
        } catch (err) {
            return err.message
        }
    }
}
