import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken'
import { ProductController } from '../controllers/productControllers.js';
import { CartController } from '../controllers/cartControllers.js';
import { UserController } from '../controllers/userControllers.js';
import { authToken } from '../utils.js';

const router = Router();
const productController = new ProductController();
const cartController = new CartController();
const userController = new UserController();

router.get('/products-views', async (req, res) => {
  try {
    if (req.session.username) {
      const { limit = 5, page = 1, sort, category } = req.query;

      const parsedLimit = parseInt(limit, 5);
      const effectiveLimit = isNaN(parsedLimit) ? 5 : parsedLimit;

      let filter = {};
      let sortOption = {};

      // Aplica filtro por categoría si se proporciona el parámetro query
      if (category) {
          filter = { $or: [{ category: category }] };
      }

      // Aplica ordenamiento por precio si se proporciona el parámetro sort
      if (sort) {
          sortOption = { price: sort === 'asc' ? 1 : -1 };
      }
    
      // Utiliza el método paginate de Mongoose para obtener la paginación
      const options = {
          page: parseInt(page),
          limit: effectiveLimit,
          sort: sortOption,
      };
      console.log('UserID en sesión:', req.session.user);
      const result = await productController.paginate(filter, options);
      res.render('products', {
          title: 'Listado de Productos',

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
    } else {
      res.redirect('/login');
    }
  } catch (error) {
      console.error(error);
      res.status(500).send({ status: 'ERR', data: 'Hubo un error en el servidor' });
  }
});

router.get('/cart/:cartId', async (req, res) => {
  try {
      const cartId = req.params.cartId;
      const cart = await cartModel.findById(cartId).populate('products.product');

      if (cart) {
          res.render('cart', { title: 'Carrito de Compras', cart });
      } else {
          res.status(404).render('error', { message: 'Carrito no encontrado' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Error en el servidor' });
  }
});

router.post('/cart/:cartId/product/:productId', async (req, res) => {
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const addProductResult = await cartController.addProductToCart(cartId, productId);

    if (addProductResult !== null) {
      res.status(201).json({ data: addProductResult });
    } else {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
});


router.put('/cart/:cartId/product/:productId', async (req, res) => {
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

router.delete('/cart/:cartId/product/:productId', async (req, res) => {
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

router.get('/cart/quantity/:cartId', async (req, res) => {
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

router.get('/github', passport.authenticate('githubAuth', { scope: ['user:username'] }), async (req, res) => {
})

router.get('/githubcallback', passport.authenticate('githubAuth', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = { username: req.user.email, admin: true }
    // req.session.user = req.user
    res.redirect('/profile')
})

router.get('/login', async (req, res) => {
  try {
      // Verificar si el token está presente en las cookies
      const token = req.cookies.codertoken;

      if (token) {
          // Verificar y decodificar el token JWT
          const decoded = await jwt.verify(token, process.env.PRIVATE_KEY);

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

router.post('/user/:userId/product/:productId', async (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;

  // Llama a la función del controlador de usuario para agregar el producto al carrito
  const addProductResult = await userController.agregarAlCarrito(userId, productId);

  res.status(addProductResult.status).json({ mensaje: addProductResult.mensaje });
});


export default router;
