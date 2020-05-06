const express = require("express");
const bodyParser = require("body-parser");
const back = require("./src/back");
const spcStatsv1 = require("./src/back/spcAPI/v1");
const spcStatsv2 = require("./src/back/spcAPI/v2");

const lqStatsv1 = require("./src/back/lqAPI/v1");
const lqStatsv2 = require("./src/back/lqAPI/v2");

const povertyStatsv1 = require("./src/back/povertyAPI/v1");
const povertyStatsv2 = require("./src/back/povertyAPI/v2");

var app = express();

app.use(bodyParser.json());

back(app);

lqStatsv1(app);
lqStatsv2(app);


spcStatsv2(app);
spcStatsv1(app);

povertyStatsv1(app);
povertyStatsv2(app);

var port = process.env.PORT || 80;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");