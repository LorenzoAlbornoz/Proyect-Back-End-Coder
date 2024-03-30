import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
import bcrypt from 'bcrypt';

const requester = supertest('http://localhost:8080');
const mongoUri = 'mongodb://localhost:27017/coder_55605';

describe('Testing', function () {
    describe('Testing Sessions', function () {
        before(async function () {
            await mongoose.connect(mongoUri);
            // Puedes realizar alguna acción adicional aquí, como crear un usuario para las pruebas.
        });

        after(async function () {
            await mongoose.disconnect();
            // Puedes realizar alguna acción adicional aquí, como eliminar el usuario creado para las pruebas.
        });

        it('POST /login debe autenticar al usuario y devolver un token', async function () {
            // Crear un usuario simulado con contraseña hash
            const user = {
                email: 'Alberto@gmail.com',
                password: await bcrypt.hash('Alberto123', 10),
            };

            const result = await requester
                .post('/api/login')
                .send({ email: user.email, password: 'Alberto123' });

            console.log('Response:', result.body);

            expect(result).to.have.property('status').equal(200);
            expect(result.body).to.have.property('token');
        });

        it('POST /login debe devolver un error 404 si el usuario no existe', async function () {
            const nonExistentUserCredentials = {
                email: 'noexistente@example.com',
                password: 'password123',
            };

            const result = await requester
                .post('/api/login')
                .send(nonExistentUserCredentials);

            console.log('Response:', result.body);

            expect(result).to.have.property('status').equal(404);
            expect(result.body).to.have.property('mensaje').equal('Usuario no encontrado');
        });

        it('POST /login debe devolver un error 400 si la contraseña es inválida', async function () {
            // Crear un usuario simulado con contraseña hash
            const user = {
                email: 'Alberto@gmail.com',
                password: await bcrypt.hash('contraseñacorrecta', 10),
            };

            const result = await requester
                .post('/api/login')
                .send({ email: user.email, password: 'contraseñaincorrecta' });

            console.log('Response:', result.body);

            expect(result).to.have.property('status').equal(400);
            expect(result.body).to.have.property('mensaje').equal('La contraseña es inválida');
        });
    });
});

