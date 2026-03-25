//src/utils/logger.js
const isDev = process.env.NODE_ENV !== "production";
const logger = {
info: (...args) => {
  if (isDev) {
    console.log("[INFO]", ...args);
  }
},

error: (...args) => {
  console.error("[ERROR]", ...args);
},

debug: (...args) => {
  if (isDev) {
    console.log("[DEBUG]", ...args);
  }
},
warn: (...args) => {
    console.warn("[WARN]", ...args); // always
},
};

module.exports = logger;