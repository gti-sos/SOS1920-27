const express = require("express");
const bodyParser = require("body-parser");
const back = require("./src/back");
const app = express();

const path = require("path");
const spcAPI = require(path.join(__dirname,'spcAPI'));
const lqAPI = require(path.join(__dirname,'lqAPI'));
const povertyAPI = require(path.join(__dirname,'povertyAPI'));

const port = process.env.PORT || 80;

//para la pagina inicio
app.use(bodyParser.json());
app.use("/",express.static("./public"));

back(app);
spcAPI(app);
lqAPI(app);
povertyAPI(app);


app.listen(port, () => {
	console.log("Server ready");
});
//aaaaaa
//Inicio serv

