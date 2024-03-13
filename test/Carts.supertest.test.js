import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

const requester = supertest('http://localhost:8080');
const mongoUri = 'mongodb://localhost:27017/coder_55605';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWNmNTgzMjI1ODk5ZTY0M2UyZDViNTciLCJuYW1lIjoiQWRtaW4gQ29kZXIiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImNhcnQiOiI2NWNmNTgzMjI1ODk5ZTY0M2UyZDViNTkiLCJmYXZvcml0ZSI6IjY1Y2Y1ODMyMjU4OTllNjQzZTJkNWI1YiIsImlhdCI6MTcwOTgxMTk2MiwiZXhwIjoxNzA5ODE1NTYyfQ.1JHdefEPjy2DxM885NnHmDHpGgUMeV_V7vAxC4m7_pQ';

describe('Testing', function () {
    describe('Testing Users', function () {
        before(async function () {
            await mongoose.connect(mongoUri);
            await mongoose.connection.collection('users-test').drop();
        });

        after(async function () {
            await mongoose.disconnect();
        });

        it('POST /api/cart/:cid/product/:pid debe agregar un producto al carrito', async function () {
            const cartId = '65d02f399799e8b068da6164';
            const productId = '65cf54ad25899e643e2d5a05';

            const result = await requester
                .post(`/api/cart/${cartId}/product/${productId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(result).to.haveOwnProperty('status');
            expect(result.body).to.have.property('data');
        })

        it('PUT /api/cart/:cartId/product/:productId debe actualizar la cantidad de un producto en el carrito', async function () {
            const cartId = '65d02f399799e8b068da6164';
            const productId = '65cf54ad25899e643e2d5a05';
            const newQuantity = 3;
        
            const result = await requester
                .put(`/api/cart/${cartId}/product/${productId}`)
                .send({ quantity: newQuantity })
                .set('Authorization', `Bearer ${token}`);
        
            console.log('Response:', result.body);
        
            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('message');
            expect(result.body.message).to.equal('Cantidad del producto actualizada exitosamente');
        });


        it('GET /api/cart/quantity/:cartId debe retornar la cantidad de productos de un cart por su ID', async function () {
            const cartId = '65d02f399799e8b068da6164';
            const result = await requester.get(`/api/cart/quantity/${cartId}`);
            const body = result.body;

            console.log('Response:', result.body);

            expect(body).to.haveOwnProperty('quantity');
            expect(body.quantity).to.exist;
        })
    });
});

