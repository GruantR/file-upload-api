// test/__mocks__/s3Storage.js

class MockS3Storage {
  constructor() {
    this.files = new Map(); // Хранилище файлов в памяти
  }

  /**
   * SAVE - Сохраняет файл в mock-хранилище
   * @param {Object} file - Объект файла от multer
   * @param {Object} fileData - Данные файла из БД
   * @returns {Promise<string>} URL мок-файла
   */
  async save(file, fileData) {
    const key = file.filename;
    this.files.set(key, {
      data: file.buffer || 'mock-file-content',
      metadata: file,
      fileData: fileData
    });
    return `http://mock-minio:9000/bucket/${key}`;
  }

  /**
   * GET_STREAM - Возвращает поток файла для скачивания
   * @param {string} fileName - Имя файла
   * @returns {Promise<Object>} Объект с методом pipe
   */
  async getStream(fileName) {
    const file = this.files.get(fileName);
    if (!file) {
      throw new Error('File not found');
    }
    // Имитация потока для ответа
    return {
      pipe: (res) => {
        res.end('mock-file-content');
      }
    };
  }

  /**
   * GET_PATH - Возвращает путь к файлу
   * @param {string} fileName - Имя файла
   * @returns {Promise<string>} Мок-путь к файлу
   */
  async getPath(fileName) {
    return `http://mock-minio:9000/bucket/${fileName}`;
  }

  /**
   * DELETE - Удаляет файл из хранилища
   * @param {string} fileName - Имя файла
   * @returns {Promise<boolean>} true если удалён
   */
  async delete(fileName) {
    this.files.delete(fileName);
    return true;
  }
}

module.exports = MockS3Storage;