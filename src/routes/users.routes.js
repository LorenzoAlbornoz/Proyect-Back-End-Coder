import { Router } from 'express'
import { UserController } from '../controllers/userControllers.js'
import { authToken } from '../utils.js'
import handlePolicies from '../config/policies.auth.js'

const router = Router()
const userController = new UserController()

router.get('/users', async (req, res) => {
  try {
    const users = await userController.getUsers()

    res.status(200).send({status: 'OK', users})
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
  }
})

  router.put('/user/:id', authToken, handlePolicies(['admin', 'premium']), async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const { name, role } = req.body;
  
      // Verificar si al menos uno de los campos (name, role) está presente
      if (!name && !role) {
        return res.status(400).send({ status: 'ERR', data: 'No fields provided for update' });
      }
  
      // Crear el objeto actualizado del usuario
      const updatedUser = {
        name,
        role,
      };
  
      const userResult = await userController.updateUser(id, updatedUser);
  
      // Verificar el resultado y enviar la respuesta correspondiente
      if (userResult.status === 200) {
        res.status(200).send({ status: 'OK', data: userResult.user });
      } else if (userResult.status === 404) {
        res.status(404).send({ status: 'ERR', data: 'User not found' });
      } else {
        res.status(500).send({ status: 'ERR', data: 'Internal server error' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Hubo un error, inténtelo más tarde', status: 500 });
    }
});
 
  
  router.delete('/user/:userId',authToken ,handlePolicies(['admin', 'premium']) , async (req, res) => {
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