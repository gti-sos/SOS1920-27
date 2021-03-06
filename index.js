const express = require("express");
const bodyParser = require("body-parser");
const request = require("request")
const Chartist = require("chartist")

const spcStatsv1 = require("./src/back/spcAPI/v1");
const spcStatsv2 = require("./src/back/spcAPI/v2");
const spcStatsv3 = require("./src/back/spcAPI/v3");
const lqStatsv1 = require("./src/back/lqAPI/v1");
const lqStatsv2 = require("./src/back/lqAPI/v2");
const povertyStatsV1 = require("./src/back/povertyAPI/v1");
const povertyStatsV2 = require("./src/back/povertyAPI/v2");

var cors = require('cors');

var app = express();

app.use(cors());

app.use(bodyParser.json());

spcStatsv3(app);
spcStatsv2(app);
spcStatsv1(app);

lqStatsv1(app);
lqStatsv2(app);

povertyStatsV1(app);
povertyStatsV2(app);

var port = process.env.PORT || 8000;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");