import mercadopago from "mercadopago";
import config from '../config.js'
import { CartService } from "../services/carts.mongo.dao.js";

const cartService = new CartService()

export const createOrder = async (req, res) => {
  mercadopago.configure({
    access_token: config.MERCADOPAGO_API_KEY,
  });

  try {
       const { cartId } = req.params;
       // Obtener el carrito de la base de datos
       const cart = await cartService.getCartById(cartId);

       // Verificar si se encontró el carrito
       if (!cart) {
         return res.status(404).json({ message: "Cart not found" });
       }
   
       // Construir los ítems de la orden utilizando los productos del carrito
       const items = cart.products.map(product => ({
        title: product.product.title, // Acceder al título del producto
        unit_price: product.unit_amount, // Acceder al precio unitario del producto
        currency_id: product.currency, // Acceder a la moneda del producto
        quantity: product.quantity,
      }));
       // Crear la preferencia de pago en MercadoPago
       const result = await mercadopago.preferences.create({
         items: items,
         notification_url: "https://e720-190-237-16-208.sa.ngrok.io/webhook",
         back_urls: {
           success: "http://localhost:4000/success",
           // pending: "https://e720-190-237-16-208.sa.ngrok.io/pending",
           // failure: "https://e720-190-237-16-208.sa.ngrok.io/failure",
         },
       });
   
       console.log(result);
   
       // Devolver la respuesta de MercadoPago
       res.json(result.body);
     } catch (error) {
       console.error(error);
       return res.status(500).json({ message: "Something went wrong" });
     }
   };

export const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query;
    console.log(payment);
    if (payment.type === "payment") {
      const data = await mercadopago.payment.findById(payment["data.id"]);
      console.log(data);
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

