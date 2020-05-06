const express = require("express");
const bodyParser = require("body-parser");
const back = require("./src/back");
const spcStatsv1 = require("./src/back/spcAPI/v1");
const spcStatsv2 = require("./src/back/spcAPI/v2");
const lqStats = require("./src/back/lqAPI");
const povertyStats = require("./src/back/povertyAPI");
var app = express();

app.use(bodyParser.json());

back(app);

spcStatsv2(app);
spcStatsv1(app);

lqStats(app);
povertyStats(app);

var port = process.env.PORT || 80;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");