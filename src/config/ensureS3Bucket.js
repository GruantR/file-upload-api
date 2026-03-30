const { S3Client, CreateBucketCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");
const logger = require("../utils/logger");

/**
 * Ensures MINIO_BUCKET exists (MinIO does not create it automatically).
 * No-op if MINIO_ENDPOINT or MINIO_BUCKET is missing.
 */
async function ensureS3Bucket() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET;
  if (!endpoint || !bucket) {
    return;
  }

  const client = new S3Client({
    endpoint,
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    logger.info(`MinIO bucket OK: ${bucket}`);
  } catch (err) {
    const status = err.$metadata?.httpStatusCode;
    const code = err.Code || err.name;
    const missing =
      status === 404 ||
      code === "NotFound" ||
      code === "NoSuchBucket" ||
      code === "404";

    if (!missing) {
      throw err;
    }

    try {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
      logger.info(`MinIO bucket created: ${bucket}`);
    } catch (createErr) {
      const c = createErr.Code || createErr.name;
      if (c === "BucketAlreadyOwnedByYou" || c === "BucketAlreadyExists") {
        logger.info(`MinIO bucket OK: ${bucket}`);
      } else {
        throw createErr;
      }
    }
  }
}

module.exports = ensureS3Bucket;
