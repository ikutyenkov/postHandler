const config = require("../config.json");

module.exports = new (require("../../node_modules/micro-service-modules-queue"))(config.queue ?? {});