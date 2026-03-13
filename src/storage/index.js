// src/storage/index
// Эта фабрика будет читать из .env тип хранилища (local или s3) и создавать нужный объект.



const LocalStorage = require('./drivers/LocalStorage');
const S3Storage = require('./drivers/S3Storage');

const getStorage = () => {
    const driver = process.env.STORAGE_DRIVER || 'local';

    switch(driver) {
        case 'local':
            return new LocalStorage();
        case 's3':
            return new S3Storage();
        default: return new LocalStorage();
    }
};

module.exports = getStorage;