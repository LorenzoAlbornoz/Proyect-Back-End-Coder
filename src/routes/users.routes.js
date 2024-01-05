import { Router } from 'express'
import { UserController } from '../controllers/userControllers.js'

const router = Router()
const userController = new UserController()

router.post('/user/:userId/product/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;
  
    // Llama a la función del controlador de usuario para agregar el producto al carrito
    const addProductResult = await userController.agregarAlCarrito(userId, productId);
  
    res.status(addProductResult.status).json({ mensaje: addProductResult.mensaje });
  });
  
  router.delete('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const deleteUserResult = await userController.deleteUser(userId);

        res.status(deleteUserResult.status).json({ mensaje: deleteUserResult.mensaje });
    } catch (error) {
      console.log(error)
      console.log(error)
        res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
    }
});


  export default router