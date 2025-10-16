// backend/models/index.js
const { getReadingById } = require("./Reading");

module.exports = {
  Reading: {
    findByPk: getReadingById,
  },
};
