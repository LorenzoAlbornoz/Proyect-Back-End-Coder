import * as url from 'url';
import dotenv from 'dotenv';
import { Command } from 'commander';

const commandLineOptions = new Command();
commandLineOptions
    .option('--mode <mode>')
    .option('--port <port>')
commandLineOptions.parse();

switch (commandLineOptions.opts().mode) {
    case 'prod':
        dotenv.config({ path: './.env.prod'});
        break;
    
    case 'devel':
    default:
        dotenv.config({ path: './.env.devel'});
}

const config = {
    __FILENAME: url.fileURLToPath(import.meta.url),
    __DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    MONGODB_CONNECTION: process.env.MONGODB_CONNECTION,
    PORT: process.env.PORT,
    API: process.env.API,
    ROUNDS: process.env.ROUNDS,
    CLOUD_NAME: process.env.CLOUD_NAME,
    APY_KEY: process.env.APY_KEY,
    APY_SECRET: process.env.APY_SECRET,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    UPLOAD_DIR: 'public/img',
    STRIPE_KEY: process.env.STRIPE_SECRET_KEY,
    PERSISTENCE: process.env.PERSISTENCE,
    MODE: commandLineOptions.opts().mode || 'devel',
    GITHUB_AUTH: {
        clientId: process.env.GITHUB_AUTH_CLIENT_ID,
        clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
    },
    GOOGLE_AUTH: {
        clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET
    },
    FACEBOOK_AUTH: {
        clientId: process.env.FACEBOOK_AUTH_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET
    },
    GOOGLE_APP_EMAIL: process.env.GOOGLE_APP_EMAIL,
    GOOGLE_APP_PASS: process.env.GOOGLE_APP_PASS,

    errorsDictionary: {
        ROUTING_ERROR: { code: 404, message: 'No se encuentra el endpoint solicitado' },
        FEW_PARAMETERS: { code: 400, message: 'Faltan parámetros obligatorios o están vacíos' },
        INVALID_MONGOID_FORMAT: { code: 400, message: 'El ID no contiene un formato válido de MongoDB' },
        INVALID_PARAMETER: { code: 400, message: 'El parámetro ingresado no es válido' },
        INVALID_TYPE_ERROR: { code: 400, message: 'No corresponde el tipo de dato' },
        ID_NOT_FOUND: { code: 400, message: 'No existe registro con ese ID' },
        PAGE_NOT_FOUND: { code: 404, message: 'No se encuentra la página solicitada' },
        DATABASE_ERROR: { code: 500, message: 'No se puede conectar a la base de datos' },
        INTERNAL_ERROR: { code: 500, message: 'Hubo un error en el servidor' },
        RECORD_CREATION_ERROR: { code: 500, message: 'Error al intentar crear el registro' },
        RECORD_CREATION_OK: { code: 200, message: 'Registro creado' },
    }
};

export default config;