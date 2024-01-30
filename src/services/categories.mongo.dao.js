import categoryModel from "../models/categorySchema.js"

export class CategoryService{
    constructor(){
    }
    async getCategories(){
        try {
            return await categoryModel.find().lean()
        } catch (err) {
            return err.message;
        }
    }

    async getCategoryById(id){
       try {
        const category = await categoryModel.findById(id)
        return category === null ? 'No se encuentra la categoria' : category
        } catch (err) {
            return err.message
        }
    }
    
    async createCategory(category){
        try {
            const categories = await categoryModel.create(category);
            return categories === null ? 'No se pudo crear la categoria' : 'Categoria creado'
        } catch (err) {
            return err.message
        }
    }
    
    async deleteCategory(id){
        try {
            const procedure = await categoryModel.findByIdAndDelete(id)
            return procedure
        } catch (err) {
            return err.message
        }
    }
}



