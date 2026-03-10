// src/utils/validation.js
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(uuid) {
    return uuidRegex.test(uuid);
}

module.exports = isValidUUID;