import { Router } from 'express'
import { UserController } from '../controllers/userControllers.js'
import { authToken } from '../utils.js'
import handlePolicies from '../config/policies.auth.js'

const router = Router()
const userController = new UserController()

router.get('/users', async (req, res) => {
  try {
    const users = await userController.getUsers()

    res.status(200).send({status: 'OK', data: users})
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
  }
})

router.post('/user/:userId/product/:productId',authToken ,handlePolicies(['admin']) , async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;
  
    // Llama a la función del controlador de usuario para agregar el producto al carrito
    const addProductResult = await userController.agregarAlCarrito(userId, productId);
  
    res.status(addProductResult.status).json({ mensaje: addProductResult.mensaje });
  });
  
  router.delete('/user/:userId',authToken ,handlePolicies(['admin']) , async (req, res) => {
    const {userId} = req.params;

    try {
        const deleteUserResult = await userController.deleteUser(userId);

        res.status(deleteUserResult.status).json({ mensaje: deleteUserResult.mensaje });
    } catch (error) {
      console.log(error)
        res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
    }
});


  export default router