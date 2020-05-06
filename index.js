const express = require("express");
const bodyParser = require("body-parser");
const back = require("./src/back");
const spcStatsv1 = require("./src/back/spcAPI/v1");
const spcStatsv2 = require("./src/back/spcAPI/v2");
<<<<<<< HEAD
const lqStatsv1 = require("./src/back/lqAPI/v1");
const lqStatsv2 = require("./src/back/lqAPI/v2");
const povertyStats = require("./src/back/povertyAPI");
=======
const lqStats = require("./src/back/lqAPI");
const povertyStatsv1 = require("./src/back/povertyAPI/v1");
const povertyStatsv2 = require("./src/back/povertyAPI/v2");
>>>>>>> 1ed5bb22a836cfcd413f4e1a404d64d19df80902
var app = express();

app.use(bodyParser.json());

back(app);

spcStatsv2(app);
spcStatsv1(app);

<<<<<<< HEAD
lqStatsv1(app);
lqStatsv2(app);

povertyStats(app);
=======
lqStats(app);

povertyStatsv1(app);
povertyStatsv2(app);
>>>>>>> 1ed5bb22a836cfcd413f4e1a404d64d19df80902

var port = process.env.PORT || 80;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");