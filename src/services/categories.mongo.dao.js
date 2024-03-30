import categoryModel from "../models/categorySchema.js"
import cloudinary from 'cloudinary'

export class CategoryService {
    constructor() {
    }
    async getCategories() {
        try {
            const categories = await categoryModel.find()
            return categories
        } catch (err) {
            return err.message;
        }
    }

    async getCategoryById(id) {
        try {
            const category = await categoryModel.findById(id)
            return category === null ? 'No se encuentra la categoria' : category
        } catch (err) {
            return err.message
        }
    }

    async createCategory(category) {
        try {
            const categories = await categoryModel.create(category);
            return categories === null ? 'No se pudo crear la categoria' : 'Categoria creado'
        } catch (err) {
            return err.message
        }
    }

    async updateCategory(id, newContent) {
        try {
            const category = await categoryModel.findById(id);

            if (newContent.image) {
                const updatedCategory = await categoryModel.findByIdAndUpdate(id, newContent, { new: true });

                if (category && category.image) {

                    const publicId = category.image.split('/').pop().replace(/\.[^/.]+$/, '');
                    await cloudinary.uploader.destroy(publicId);
                }

                return updatedCategory;
            } else {
                const updatedCategory = await categoryModel.findByIdAndUpdate(id, newContent, { new: true });

                return updatedCategory;
            }
        } catch (err) {
            return err.message;
        }
    }

    async deleteCategory(id) {
        try {
            const category = await categoryModel.findById(id);

            const deletedCategory = await categoryModel.findByIdAndDelete(id);

            if (category && category.image) {

                const publicId = category.image.split('/').pop().replace(/\.[^/.]+$/, '');

                await cloudinary.uploader.destroy(publicId);
            }

            return deletedCategory;
        } catch (err) {
            return err.message
        }
    }
}



