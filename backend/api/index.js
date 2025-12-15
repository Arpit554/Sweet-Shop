const app = require("../src/app");
const connectDB = require("../src/db");

// Connect DB once per cold start
let isConnected = false;

async function initDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

module.exports = async (req, res) => {
  await initDB();
  return app(req, res);
};
