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

<<<<<<< HEAD
var port = process.env.PORT || 81;
=======
var port = process.env.PORT || 80;
>>>>>>> b7966b5698c96dc74c60d4a84ccb7a233c3391db

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");