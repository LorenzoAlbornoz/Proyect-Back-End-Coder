import { Router } from 'express'
import { UserController } from '../controllers/userControllers.js'
import { authToken } from '../utils.js'
import handlePolicies from '../config/policies.auth.js'
import { uploader } from '../uploader.js'
import config from '../config.js'
import nodemailer from 'nodemailer'
import UserModel from '../models/userSchema.js'

const router = Router()
const userController = new UserController()

router.get('/users', async (req, res) => {
  try {
    const users = await userController.getUsers()

    res.status(200).send({ status: 'OK', users })
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
  }
})

router.post('/user/:uid/documents', authToken, uploader.array('documents', 5), async (req, res) => {
  try {
    const { uid } = req.params;
    const { files } = req;

    if (!files || files.length === 0) {
      return res.status(400).json({ mensaje: 'No se proporcionaron documentos para subir', status: 400 });
    }

    const updatedUser = {
      $push: {
        documents: files.map(file => ({
          name: file.originalname,
          reference: file.path,
        })),
      },
    };

    const userResult = await userController.updateUser(uid, updatedUser);

    if (userResult.status === 200) {
      res.status(200).json({ status: 'OK', data: userResult.user });
    } else if (userResult.status === 404) {
      res.status(404).json({ status: 'ERR', data: 'Usuario no encontrado' });
    } else {
      res.status(500).json({ status: 'ERR', data: 'Error interno del servidor' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un error, inténtelo más tarde', status: 500 });
  }
});

router.put('/user/premium/:id', authToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { user } = await userController.getUserByID(id);
    if (!user.documents || user.documents.length < 3) {
      return res.status(400).json({ status: 'ERR', data: 'El usuario no ha cargado todos los documentos requeridos' });
    }

    const updatedUser = {
      role: 'premium',
    };

    const userResult = await userController.updateUser(id, updatedUser);

    if (userResult.status === 200) {
      res.status(200).json({ status: 'OK', data: userResult.user });
    } else if (userResult.status === 404) {
      res.status(404).json({ status: 'ERR', data: 'Usuario no encontrado' });
    } else {
      res.status(500).json({ status: 'ERR', data: 'Error interno del servidor' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un error, inténtelo más tarde', status: 500 });
  }
});

router.put('/user/:id', authToken, handlePolicies(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!name && !role) {
      return res.status(400).send({ status: 'ERR', data: 'No fields provided for update' });
    }

    const updatedUser = {
      name,
      role,
    };

    const userResult = await userController.updateUser(id, updatedUser);

    if (userResult.status === 200) {
      res.status(200).send({ status: 'OK', data: userResult.user });
    } else if (userResult.status === 404) {
      res.status(404).send({ status: 'ERR', data: 'User not found' });
    } else {
      res.status(500).send({ status: 'ERR', data: 'Internal server error' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un error, inténtelo más tarde', status: 500 });
  }
});

router.delete('/user/:userId', authToken, handlePolicies(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const deleteUserResult = await userController.deleteUser(userId);

    res.status(deleteUserResult.status).json({ mensaje: deleteUserResult.mensaje });
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error, inténtelo más tarde", status: 500 });
  }
});

router.delete('/inactiveUsers', authToken, async (req, res) => {
  try {
    const cutoffTime = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Un año en milisegundos
    const inactiveUsers = await UserModel.find({ last_connection: { $lt: cutoffTime } });

    for (const user of inactiveUsers) {

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.GOOGLE_APP_EMAIL,
          pass: config.GOOGLE_APP_PASS
        }
      });

      const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: user.email,
        subject: 'Eliminación de cuenta por inactividad',
        text: `Tu cuenta ha sido eliminada debido a la inactividad. Si deseas recuperarla, ponte en contacto con el soporte.`
      };

      await transporter.sendMail(mailOptions);

      await UserModel.findByIdAndDelete(user._id);
    }

    res.status(200).json({ mensaje: 'Usuarios inactivos eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un error al eliminar usuarios inactivos', error: error.message });
  }
});


export default router