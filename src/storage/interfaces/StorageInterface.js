// src/storage/interfaces/StorageInterface.js
/* Abstract class that defines the shape for all storage drivers
   This is just a list of what any storage must implement. It does nothing itself — it only states:
   "If you want to be a storage driver — implement save, getPath, and delete." */

class StorageInterface {
    async save(file, fileData) {
        throw new Error('save() method must be implemented');
    }

    async getPath(fileName) {
        throw new Error('getPath() method must be implemented');
    }

    async delete(fileName) {
        throw new Error('delete() method must be implemented');
    }
};

module.exports = StorageInterface;