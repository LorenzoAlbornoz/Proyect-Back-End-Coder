import fs from 'fs'

export default class ProductManager {
  constructor(path) {
    this.path = path;
    this.currentId = 0;
    this.products = [];
  }

  async addProduct(product) {
    this.currentId++;
    product.id = this.currentId;
    this.products.push(product);
    await fs.promises.writeFile(this.path, JSON.stringify(this.products));
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
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data);
      const product = products.findIndex((product) => product.id === id);

      if (product !== -1) {
        products[product] = { ...products[product], ...newProductData };

        await fs.promises.writeFile(this.path, JSON.stringify(products));
        console.log("Producto actualizado:", products[product]);
      } else {
        console.log("Producto no encontrado, no se pudo actualizar.");
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  }

  async deleteProduct(id) {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data);
      const product = products.findIndex((product) => product.id === id);

      if (product !== -1) {
        products.splice(product, 1);

        await fs.promises.writeFile(this.path, JSON.stringify(products));
        console.log("Producto eliminado:", products[product]);
      } else {
        console.log("Producto no encontrado");
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  }
}