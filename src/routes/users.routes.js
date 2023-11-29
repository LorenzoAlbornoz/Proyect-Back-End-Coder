import { Router } from 'express'
import { UserController } from '../controllers/userController.js'

const router = Router()
const controller = new UserController()

router.get('/', async (req, res) => {
    const users = await controller.getUsers()
    res.status(200).send({ status: 'OK', data: users })
})

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await controller.getUserById(id);
    res.status(200).send({ status: 'OK', data: user })
})

router.post('/', async (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
    }

    const newContent = {
        name,
        username,
        password,
    };

    const result = await controller.addUser(newContent);
    res.status(200).send({ status: 'OK', data: result });
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const { name, username, password} = req.body;

    if (!name || !username || !password ) {
        return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
    }

    const user = await controller.updateUser( id,{
        name,
        username,
        password
    }, { new: true });
    res.status(200).send({ status: 'OK', data: user })
    })

    router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await controller.deleteUser(id);
    res.status(200).send({ status: 'OK', data: user })
    })
export default router