// src/config/upload.js
/* This configuration file reads the upload path from .env and converts it to an absolute path
   so that the exact path to the uploads folder is known anywhere in the project.
   process.cwd() - current working directory (project root)
   path.resolve() - joins paths into an absolute path
   || './uploads' - default value if not set in .env
*/


 const path = require('path');
 const uploadDir = process.env.UPLOADS_PATH || './uploads';

 const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);

 module.exports = {
    uploadDir,
    absoluteUploadDir
 };