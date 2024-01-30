import { CategoryService } from "../services/categories.mongo.dao.js";

const categoryService = new CategoryService()

export class CategoryController{
  constructor(){
  }

  async getCategories(){
    try {
      return await categoryService.getCategories()
    } catch (err) {
      return err.message
    }
  }

  async getCategoryById(id){
    try {
      return await categoryService.getCategoryById(id)
    } catch (err) {
      return err.message
    }
  }

  async createCategory(category){
    try {
      return await categoryService.createCategory(category)
    } catch (err) {
      return err.message
    }
  }

  async deleteCategory(id){
    try {
      return await categoryService.deleteCategory(id)
    } catch (err) {
      return err.message
    }
  }

}