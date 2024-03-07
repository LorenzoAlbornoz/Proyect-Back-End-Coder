import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

const requester = supertest('http://localhost:8080');
const mongoUri = 'mongodb://localhost:27017/coder_55605';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWNmNTgzMjI1ODk5ZTY0M2UyZDViNTciLCJuYW1lIjoiQWRtaW4gQ29kZXIiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImNhcnQiOiI2NWNmNTgzMjI1ODk5ZTY0M2UyZDViNTkiLCJmYXZvcml0ZSI6IjY1Y2Y1ODMyMjU4OTllNjQzZTJkNWI1YiIsImlhdCI6MTcwOTc3MzE3MiwiZXhwIjoxNzA5Nzc2NzcyfQ.kzm1uhk0GqLgcaovmfh_MZP97Nu9q7pinqhdr3z6TcY';

describe('Testing', function () {
    describe('Testing Products', function () {
        before(async function () {
            await mongoose.connect(mongoUri);
            await mongoose.connection.collection('products-test').drop();
        });

        after(async function () {
            await mongoose.disconnect();
        });

        it('GET /api/products debe retornar un array de productos', async function () {
            const result = await requester.get('/api/products');
            const body = result.body;

            expect(body).to.haveOwnProperty('status');
            expect(body.products).to.be.an('array');
        });

        it('GET /api/products/search debe retornar un array de productos por su titulo', async function () {
            const result = await requester.get('/api/products/search').query({ productName: 'IPhone' });
            const body = result.body;

            expect(body).to.haveOwnProperty('status');
            expect(body.products).to.be.an('array');
            expect(body.products.length).to.be.at.least(1);

            if (body.products.length > 0) {
                expect(body.products[0].title).to.include('iPhone');
            }
        });

        it('GET /api/products/category debe retornar un array de productos por su categoria', async function () {
            const result = await requester.get('/api/products/category').query({ categoryName: 'Lavado' });
            const body = result.body;


            expect(body).to.haveOwnProperty('status');
            expect(body.products).to.be.an('array');
            expect(body.products.length).to.be.at.least(1);

            if (body.products.length > 0) {
                expect(body.products[0].category.name).to.include('Lavado');
            }
        });
        it('GET /api/product/:id debe retornar un producto por su ID', async function () {
            const productId = '65cf54ad25899e643e2d5a05'; // ID del producto que deseas recuperar
            const result = await requester.get(`/api/product/${productId}`);
            const body = result.body;

            expect(body).to.haveOwnProperty('status');
            expect(body.product).to.exist;
            expect(body.product._id).to.equal(productId);
        });

        it('POST /api/product debe crear un nuevo producto', async function () {
            const imageFilePath = 'C:\\Users\\Usuario\\Downloads\\Electrodomesticos\\Celulares\\Celular TCL 40SE\\1.webp';

            // Realizar la solicitud para crear un nuevo producto
            const createResult = await requester
                .post('/api/product')
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Lavarropa Gafa')
                .field('description', 'Lavarropas Carga Superior Gafa FuzzyFit 7kg Blanco')
                .field('price', '510099')
                .field('category', '65cf51ca25899e643e2d59e2')
                .field('code', 'LF-2')
                .field('stock', '5')
                .attach('images', imageFilePath)

            // Verificar que la creación del producto fue exitosa
            expect(createResult.status).to.equal(200);
            expect(createResult.body).to.haveOwnProperty('status').to.equal('OK');

            // Capturar el ID del producto creado
            const productId = createResult.body.data._id;
            this.productId = productId;  // Guardar el ID para usarlo en la prueba de eliminación
        });

        it('PUT /api/product/featured/:id debe actualizar el estado destacado del producto', async function () {
            const productId = this.productId;
            const result = await requester
                .put(`/api/product/featured/${productId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'OK');
            expect(result.body).to.have.property('data');
            expect(result.body.data.isFeatured).to.equal(true);
        });

        it('PUT /api/product/offer/:id debe actualizar el estado de oferta del producto', async function () {
            const productId = this.productId;
            const result = await requester
                .put(`/api/product/offer/${productId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'OK');
            expect(result.body).to.have.property('data');
            expect(result.body.data.isOffer).to.equal(true);
        });

        it('PUT /api/product/:id debe actualizar un producto por su ID', async function () {
            const productId = this.productId;
            const imageFilePath = 'C:\\Users\\Usuario\\Downloads\\Electrodomesticos\\Celulares\\Celular TCL 40SE\\1.webp';


            // Realizar la solicitud para actualizar el producto por su ID
            const updateResult = await requester
                .put(`/api/product/${productId}`)
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Lavarropa Gafa Premium')
                .field('description', 'Lavarropas Carga Superior Gafa FuzzyFit 7kg Blanco')
                .field('price', '510099')
                .field('category', '65cf51ca25899e643e2d59e2')
                .field('code', 'LF-2')
                .field('stock', '25')
                .attach('images', imageFilePath)

            // Verificar que la actualización del producto fue exitosa
            expect(updateResult.status).to.equal(200);
            expect(updateResult.body).to.haveOwnProperty('status').to.equal('OK');
            expect(updateResult.body).to.haveOwnProperty('data');
        });

        it('DELETE /api/product/:id debe eliminar un producto por su ID', async function () {
            // Obtener el ID del producto creado en la prueba anterior
            const productId = this.productId;

            // Realizar la solicitud para eliminar el producto por su ID
            const deleteResult = await requester
                .delete(`/api/product/${productId}`)
                .set('Authorization', `Bearer ${token}`)

            // Verificar que la eliminación del producto fue exitosa
            expect(deleteResult.status).to.equal(200);
            expect(deleteResult.body).to.haveOwnProperty('status').to.equal('OK');
            expect(deleteResult.body).to.haveOwnProperty('data');
        });
    });
});


