import dotenv from 'dotenv';

dotenv.config();

const config = {
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
    }
};

export default config;