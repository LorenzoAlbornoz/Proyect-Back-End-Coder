import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';

const requester = supertest('http://localhost:8080');
const mongoUri = 'mongodb://localhost:27017/coder_55605';

describe('Testing', function () {
    describe('Testing Sessions', function () {
        before(async function () {
            await mongoose.connect(mongoUri);
            await mongoose.connection.collection('sessions-test').drop();
        });

        after(async function () {
            await mongoose.disconnect();
        });

    });
});
