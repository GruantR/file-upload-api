// src/storage/index.js
// Storage factory: returns driver based on storage type stored in DB (localStorage/s3Storage)

const LocalStorage = require('./drivers/LocalStorage');
const S3Storage = require('./drivers/S3Storage');

const getStorageByType = (type) => {
    switch(type) {
        case 'localStorage':
            return new LocalStorage();
        case 's3Storage':
            return new S3Storage();
        default:
            return new LocalStorage();
    }
};
module.exports = { getStorageByType };