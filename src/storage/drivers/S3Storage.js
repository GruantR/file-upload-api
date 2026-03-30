// src/storage/S3Storage.js

// Import parent class to inherit its methods
const StorageInterface = require("../interfaces/StorageInterface");
// AWS SDK for S3 operations
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const logger = require("../../utils/logger");

class S3Storage extends StorageInterface {
  constructor() {
    super(); // call parent constructor
    // this.client — class property holding the S3Client instance for sending requests to S3
    this.client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Forces client to use proper URL format for MinIO
    });
    this.bucket = process.env.MINIO_BUCKET; // Store bucket name for all operations
  }

  async save(file, fileData) {
    // 1. Create a read stream for the file (reads in chunks, doesn't load entire file into memory)
    const fileStream = fs.createReadStream(file.path);

    // 2. Configure upload to MinIO
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: file.filename, // file name in storage
        Body: fileStream, // file content
        ContentType: file.mimetype, // MIME type (important for browser)
      },
    });

    logger.debug("Starting upload to MinIO...");

    // 3. Upload (waits for completion)
    await upload.done();
    // 4. Delete the temporary file
    await fs.promises.unlink(file.path);

    // 5. Return file path (can be saved to DB later) (constructs URL for file access)
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${file.filename}`;
  }

  async delete(fileName) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });

    await this.client.send(command);

    return true;
    /*
      new DeleteObjectCommand({...}) — creates a deletion command
      this.client.send(command) — sends the command to MinIO
      return true — indicates successful deletion
    */
  }

  async getStream(fileName) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });
    const response = await this.client.send(command);
    return response.Body; // should be a stream
  }

  async getPath(fileName) {
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${fileName}`;
  }
}

module.exports = S3Storage;