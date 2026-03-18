// src/storage/index
// Эта фабрика будет читать из .env тип хранилища (local или s3) и создавать нужный объект.



const LocalStorage = require('./drivers/LocalStorage');
const S3Storage = require('./drivers/S3Storage');

const getStorageByType = (type) => {
        switch(type) {
        case 'localStorage':
            return new LocalStorage();
        case 's3Storage':
            return new S3Storage();
        default: return new LocalStorage();
    }
};
//getStorageByType(type) — получает драйвер по типу из БД

const getStorage = () => {
    const driver = process.env.STORAGE_DRIVER === 's3' ? 's3Storage' : 'localStorage';
    return getStorageByType(driver);
};
//getStorage() — как раньше, для обратной совместимости

module.exports = {getStorageByType, getStorage} ;