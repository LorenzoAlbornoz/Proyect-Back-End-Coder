import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { ProductController } from '../controllers/productControllers.js';
import { CartController } from '../controllers/cartControllers.js';
import { UserController } from '../controllers/userControllers.js';
import { FavoriteController } from '../controllers/favoriteControllers.js';
import { authToken } from '../utils.js';
import config from '../config.js';
import handlePolicies from '../config/policies.auth.js';

const router = Router();
const productController = new ProductController();
const cartController = new CartController();
const userController = new UserController();
const favoriteController = new FavoriteController()

router.get('/products-views', async (req, res) => {
  try {
    let userId, name, cart;

    // Verificar si hay un token presente
    const token = req.cookies.codertoken;
    if (token) {
      // Si hay un token, decodificarlo y obtener la información del usuario
      const decoded = jwt.verify(token, config.PRIVATE_KEY);
      userId = decoded.sub;
      name = decoded.name;
      cart = decoded.cart;
    }

    const { limit = 5, page = 1, sort, category } = req.query;
    const parsedLimit = parseInt(limit, 5);
    const effectiveLimit = isNaN(parsedLimit) ? 5 : parsedLimit;

    let filter = {};
    let sortOption = {};

    if (category) {
      filter = { $or: [{ category: category }] };
    }

    if (sort) {
      sortOption = { price: sort === 'asc' ? 1 : -1 };
    }

    const options = {
      page: parseInt(page),
      limit: effectiveLimit,
      sort: sortOption,
    };

    const result = await productController.paginate(filter, options);  // Renderizar la vista con la información del usuario si está autenticado
    res.render('products-views', {
      title: 'Listado de Productos',
      userId: userId || null,
      name: name || null,
      cart: cart || null,
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products-views?limit=${limit}&page=${result.prevPage}&sort=${sort}&category=${category}` : null,
      nextLink: result.hasNextPage ? `/products-views?limit=${limit}&page=${result.nextPage}&sort=${sort}&category=${category}` : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'ERR', data: 'Hubo un error en el servidor' });
  }
});

router.get('/cart/:cid', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  try {
    let userId, name, cart;

    // Verificar si hay un token presente
    const token = req.cookies.codertoken;
    if (token) {
      // Si hay un token, decodificarlo y obtener la información del usuario
      const decoded = jwt.verify(token, config.PRIVATE_KEY);
      userId = decoded.sub;
      name = decoded.name;
      cart = decoded.cart;
    }

    if (userId) {
      // Obtener el carrito del usuario utilizando el ID del carrito
      const cartId = req.params.cid;
      const cart = await cartController.getCartById(cartId);
      
      if (cart) {
        res.render('cart', {
          title: 'Carrito de Compras',
          userId: userId || null,
          name: name || null,
          cart: cart || null,
        });
      } else {
        res.status(404).render('error', { message: 'Carrito no encontrado' });
      }
    } else {
      res.status(401).render('error', { message: 'Usuario no autenticado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error en el servidor' });
  }
});

router.get('/user/:userId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await userController.getUserByID(userId);

    res.status(user.status).json({ mensaje: user.mensaje, user: user.user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
  }
});

// Ruta para eliminar un producto del favorito
router.delete('/favorite/:favoriteId/product/:productId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  try {
    const { favoriteId, productId } = req.params;
    const updatedFavorite = await favoriteController.deleteProductFromFavorite(favoriteId, productId);

    if (updatedFavorite) {
      res.status(200).json(updatedFavorite);
    } else {
      res.status(404).json({ message: 'Producto no encontrado en el favorito' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/favorite/:favoriteId/product/:productId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  try {
    const { favoriteId, productId } = req.params;
    const updatedFavorite = await favoriteController.addProductToFavorite(favoriteId, productId);

    if (updatedFavorite) {
      res.status(200).json(updatedFavorite);
    } else {
      res.status(404).json({ message: 'Producto no encontrado o favorito no existente' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/cart/:cartId/product/:productId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;
  const addProductResult = await cartController.addProductToCart(cartId, productId);

  if (addProductResult !== null) {
    res.status(201).json({ data: addProductResult });
  } else {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});


router.put('/cart/:cartId/product/:productId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;
  const newQuantity = req.body.quantity;

  try {
    const updatedCart = await cartController.editProductQuantity(cartId, productId, newQuantity);

    // Verificar si el producto se actualizó correctamente en el carrito
    if (updatedCart !== null) {
      res.json({ message: 'Cantidad del producto actualizada exitosamente' });
    } else {
      res.status(404).json({ error: 'El producto no está en el carrito' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
  }
});

router.delete('/cart/:cartId/product/:productId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;

  try {
    const updatedCart = await cartController.deleteProductFromCart(cartId, productId);

    if (updatedCart !== null) {
      // Enviar una respuesta JSON en lugar de redirigir
      res.json({ success: true, cart: updatedCart });
    } else {
      res.status(404).json({ error: 'El producto no está en el carrito' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});

router.get('/cart/quantity/:cartId', authToken, handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const cartQuantity = await cartController.getCartQuantity(cartId);

    if (cartQuantity !== null) {
      res.json({ quantity: cartQuantity });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/login', async (req, res) => {
  try {
    // Verificar si el token está presente en las cookies
    const token = req.cookies.codertoken;

    if (token) {
      // Verificar y decodificar el token JWT
      const decoded = jwt.verify(token, config.PRIVATE_KEY);

      // Puedes acceder a la información del usuario desde el token decodificado
      const { email } = decoded;

      // Renderizar la vista de productos si el usuario está autenticado
      res.render('products-views', { email });
    } else {
      // Renderizar la vista de inicio de sesión si no hay token
      res.render('login', {});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Hubo un error, inténtelo más tarde",
      status: 500,
      error: error.message,
    });
  }
});


router.get('/profilejwt', authToken, async (req, res) => {
  res.render('products-views', { user: req.user })
})

router.get('/register', async (req, res) => {
  res.render('register', {})
})

router.get('/restore', async (req, res) => {
  if (req.session.user) {
    res.redirect('/products-views');
  } else {
    res.render('restore', {})
  }
})

export default router;
