// src/storage/index.js
// This factory reads the storage type from .env (local or s3) and creates the appropriate driver

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
// getStorageByType(type) — returns a driver based on the storage type from DB

const getStorage = () => {
    const driver = process.env.STORAGE_DRIVER === 's3' ? 's3Storage' : 'localStorage';
    return getStorageByType(driver);
};
// getStorage() — legacy function for backward compatibility

module.exports = { getStorageByType, getStorage };