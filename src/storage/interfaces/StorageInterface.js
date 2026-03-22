//src/storage/interfaces/StorageInterface.js
/* Абстрактный класс, который задаёт форму для всех хранилищ
Это просто список того, что должно быть у любого хранилища. Сам он ничего не делает — только говорит:
"Если ты хочешь быть хранилищем — научись делать save, getPath и delete." */

class StorageInterface {
    async save (file,fileData) {
        throw new Error('метод save() должен быть реализован');
    }

    async getPath(fileName) {
        throw new Error ('Метод getPath() должен быть реализован')
    }

    async delete (fileName) {
        throw new Error('Метод delete() должен быть реализован');
    }
};

module.exports = StorageInterface;