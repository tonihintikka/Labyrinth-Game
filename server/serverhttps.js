const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync(
  path.join(__dirname, "localhost-key.pem"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "localhost.pem"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, "../public")));

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
  console.log("Server running on https://localhost:3000");
});
