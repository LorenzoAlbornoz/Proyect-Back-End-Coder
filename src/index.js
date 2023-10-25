const fs = require('fs')

class ProductManager {
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
      console.log(products);
    } catch (error) {
      console.error("Error al leer el archivo:", error);
    }
  }

  async getProductById(id) {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data);
      const product = products.find((product) => product.id === id);
      if (product) {
        console.log("Producto encontrado:", product);
      } else {
        console.log("Producto no encontrado");
      }
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

const product1 = new ProductManager("./products.json");
const newProduct =  [
    {
      title: "Lavadora",
      description: "Lava tus prendas de forma eficiente",
      price: 55000,
      thumbnail: "imagen-lavadora.jpg",
      code: "lav456",
      stock: 8
    },
    {
      title: "Secadora",
      description: "Seca la ropa rápidamente",
      price: 40000,
      thumbnail: "imagen-secadora.jpg",
      code: "sec789",
      stock: 7
    },
    {
      title: "Plancha de Vapor",
      description: "Elimina las arrugas con facilidad",
      price: 35000,
      thumbnail: "imagen-plancha.jpg",
      code: "vap234",
      stock: 10
    },
    {
      title: "Refrigerador",
      description: "Mantiene tus alimentos frescos",
      price: 70000,
      thumbnail: "imagen-refrigerador.jpg",
      code: "ref123",
      stock: 6
    },
    {
      title: "Batidora de Cocina",
      description: "Mezcla ingredientes con precisión",
      price: 30000,
      thumbnail: "imagen-batidora.jpg",
      code: "bat567",
      stock: 9
    },
    {
      title: "Aspiradora Robot",
      description: "Limpia tu hogar de forma automática",
      price: 65000,
      thumbnail: "imagen-aspiradora.jpg",
      code: "robo890",
      stock: 4
    },
    {
      title: "Cafetera de Capsulas",
      description: "Prepara café con comodidad",
      price: 48000,
      thumbnail: "imagen-cafetera.jpg",
      code: "caf456",
      stock: 12
    },
    {
      title: "Mesa de Comedor",
      description: "Ideal para tus reuniones familiares",
      price: 60000,
      thumbnail: "imagen-mesa.jpg",
      code: "mesa123",
      stock: 5
    },
    {
      title: "Silla de Jardín",
      description: "Disfruta del aire libre en tu jardín",
      price: 25000,
      thumbnail: "imagen-silla.jpg",
      code: "jard678",
      stock: 15
    },
    {
      title: "Laptop Ultradelgada",
      description: "Portabilidad y potencia en una sola laptop",
      price: 85000,
      thumbnail: "imagen-laptop.jpg",
      code: "lap012",
      stock: 3
    }
  ];
  
  newProduct.forEach(product => {
    product1.addProduct(product);
});

module.exports = ProductManager;