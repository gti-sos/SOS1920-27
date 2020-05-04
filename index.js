const express = require("express");
const bodyParser = require("body-parser");
const back = require("./src/back");
const spcStats = require("./src/back/spcAPI");
const lqStats = require("./src/back/lqAPI");
const povertyStats = require("./src/back/povertyAPI");
var app = express();

app.use(bodyParser.json());

back(app);
spcStats(app);
lqStats(app);
povertyStats(app);

var port = process.env.PORT || 81;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");