//src/storage/S3Storage.js

// Подключаем родительский класс, чтобы наследовать его методы
const StorageInterface = require("../interfaces/StorageInterface");
// AWS SDK для работы с S3
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

class S3Storage extends StorageInterface {
  constructor() {
    super(); //вызываем конструктор родителя
    // this.client — это  свойство класса. this.client хранит в себе объект S3Client, который умеет отправлять запросы в S3.
    this.client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Заставляет клиента использовать правильный формат URL для MinIO
    });
    this.bucket = process.env.MINIO_BUCKET; // Сохраняем название корзины для всех операций
  }

  async save(file, fileData) {
    // 1. Создаём поток для чтения файла (Открывает файл для чтения кусочками (не грузит весь в память))
    const fileStream = fs.createReadStream(file.path);

    // 2. Настраиваем загрузку в MinIO
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: file.filename, // имя файла в хранилище
        Body: fileStream, // содержимое
        ContentType: file.mimetype, // тип файла (важно для браузера)
      },
    });

    console.log("⏳ Starting upload to MinIO...");

    // 3. Загружаем(Ждёт окончания загрузки)
    await upload.done();
    // 4. Удаляем временный файл
    await fs.promises.unlink(file.path);

    // 5. Возвращаем путь к файлу (можно потом сохранить в БД) (Формирует URL, по которому файл будет доступен)
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${file.filename}`;
  }

  async delete(fileName) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket, // в какой корзине лежит файл
      Key: fileName, // имя файла
    });

    await this.client.send(command); // Отправляем команду в MinIO

    return true;
    /*
    new DeleteObjectCommand({...}) — создаём "приказ" на удаление
    this.client.send(command) — отправляем этот приказ в MinIO
    return true — говорим, что файл удалён
*/
  }

  async getStream (fileName) {
    const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
    });
    const response = await this.client.send(command)
    return response.Body; // ← должен быть поток
  }

  async getPath(fileName) {
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${fileName}`;
  }
}

module.exports = S3Storage;
