const express = require("express");
const app = express();
const path = require("path");

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, "../public")));

// Remove this line since it's redundant - the above line already handles all static files
// app.use('/css', express.static('public/css'));

// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
