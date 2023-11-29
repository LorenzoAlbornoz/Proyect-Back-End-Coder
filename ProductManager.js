import fs from 'fs'

export default class ProductManager {
  constructor(path) {
    this.path = path;
    this.currentId = 0;
    this.products = [];
  }

  async addProduct(product) {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      if (!data) {
        this.products = [];
      } else {
        this.products = JSON.parse(data);
      }

      if (this.products.length > 0) {
        this.currentId = this.products[this.products.length - 1].id;
      }
      this.currentId++;
      product.id = this.currentId;
      this.products.push(product);
      await fs.promises.writeFile(this.path, JSON.stringify(this.products));
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data);
      return products
    } catch (error) {
      console.error("Error al leer el archivo:", error);
    }
  }

  async getProductById(id) {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data);
      const product = products.find((product) => product.id === id);
      return product
    } catch (error) {
      console.error("Error al buscar el producto por ID:", error);
    }
  }

  async updateProduct(id, newProductData) {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      const products = JSON.parse(data);
  
      const productIndex = products.findIndex((product) => product.id === id);

      const updatedProduct = { ...products[productIndex], ...newProductData };
      products[productIndex] = updatedProduct;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error; // Reenvía el error para manejarlo en el controlador
    }
  }
  
  async deleteProduct(id) {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      const products = JSON.parse(data);
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex !== -1) {
        const deletedProduct = products.splice(productIndex, 1)[0];

        await fs.promises.writeFile(this.path, JSON.stringify(products));
        console.log("Producto eliminado:", deletedProduct);

        return deletedProduct;
      } else {
        console.log("Producto no encontrado");
        return null;
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      throw error;
    }
  }

}