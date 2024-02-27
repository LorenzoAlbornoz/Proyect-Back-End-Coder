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
            // Obtener el producto antes de la actualización para acceder a la URL de la imagen
            const category = await categoryModel.findById(id);
    
            // Console.log para la URL de la imagen antes de la actualización
            console.log('URL de la imagen antes de la actualización:', category.image);
    
            // Actualizar el producto en la base de datos
            const updatedCategory = await categoryModel.findByIdAndUpdate(id, newContent, { new: true });
    
            // Verificar si el producto original tenía una URL de imagen
            if (category && category.image) {
                // Extraer el public_id de la URL de la imagen en Cloudinary
                const publicId = category.image.split('/').pop().replace(/\.[^/.]+$/, '');
    
                // Eliminar la imagen antigua de Cloudinary
                await cloudinary.uploader.destroy(publicId);
            }
    
            // Console.log para el resultado de la actualización en la base de datos
            console.log('Resultado de la actualización en la base de datos:', updatedCategory);
    
            return updatedCategory;
        } catch (err) {
            // Console.log para manejar errores
            console.error('Error en la actualización:', err.message);
            return err.message;
        }
    }

    async deleteCategory(id) {
        try {
                     // Obtener el producto antes de eliminarlo para acceder a la URL de la imagen
                     const category = await categoryModel.findById(id);

                     // Console.log para la URL de la imagen antes de la eliminación
                     console.log('URL de la imagen antes de la eliminación:', category.image);
         
                     // Eliminar el producto de la base de datos
                     const deletedCategory = await categoryModel.findByIdAndDelete(id);
         
                     // Verificar si el producto existe y tiene una URL de imagen
                     if (category && category.image) {
                         // Extraer el public_id de la URL de la imagen en Cloudinary
                         const publicId = category.image.split('/').pop().replace(/\.[^/.]+$/, '');
         
                         // Eliminar la imagen de Cloudinary
                         await cloudinary.uploader.destroy(publicId);
                     }
         
                     // Console.log para el resultado de la eliminación en la base de datos
                     console.log('Resultado de la eliminación en la base de datos:', deletedCategory);
         
                     return deletedCategory;
        } catch (err) {
            return err.message
        }
    }
}



