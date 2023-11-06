import fs from 'fs';

export default class CartManager {
    constructor(path) {
        this.path = path;
        this.currentId = 0;
        this.carts = [];
    }

    async newCart(cart) {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            if (!data) {
                this.carts = [];
            } else {
                this.carts = JSON.parse(data);
            }

            if (this.carts.length > 0) {
                this.currentId = this.carts[this.carts.length - 1].id;
            }
            this.currentId++;
            cart.id = this.currentId;
            this.carts.push(cart);

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts));
        } catch (error) {
            console.error('Error al crear el carrito:', error);
        }
    }

    async getCart(id) {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            const carts = JSON.parse(data);
            const cart = carts.find((cart) => cart.id === id);
            return cart;
        } catch (error) {
            console.error('Error al leer el archivo:', error);
        }
    }

    async addProduct(cartId, productId) {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            const carts = JSON.parse(data);

            // Busca el carrito con el ID proporcionado
            const cartIndex = carts.findIndex((cart) => cart.id === cartId);

            if (cartIndex === -1) {
                console.error('Carrito no encontrado');
                return null;
            }

            // Verifica si el producto ya existe en el carrito
            const existingProductIndex = carts[cartIndex].products.findIndex((product) => product.product === productId);

            if (existingProductIndex !== -1) {
                // Si el producto ya existe, incrementa la cantidad
                carts[cartIndex].products[existingProductIndex].quantity++;
            } else {
                // Si el producto no existe, agrégalo al carrito
                const productToAdd = {
                    product: productId,
                    quantity: 1,
                };
                carts[cartIndex].products.push(productToAdd);
            }

            // Escribe los datos actualizados en el archivo
            await fs.promises.writeFile(this.path, JSON.stringify(carts));
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    }
}
