//src/config/upload
/*Это конфигурационный файл, который бужет читать путь из .env, превращать его в абсолютный путь (полный от корня диска), 
 для того чтобы в любом месте проекта мы знали точный путь к папке uploads. 
 process.cwd()	текущая рабочая директория (корень проекта)
 path.resolve()	склеивает пути в абсолютный
 || './uploads'	значение по умолчанию, если нет в .env
 */


 const path = require('path');
 const uploadDir = process.env.UPLOADS_PATH || './uploads';

 const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);

 module.exports = {
    uploadDir,
    absoluteUploadDir
 };