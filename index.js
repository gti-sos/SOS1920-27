const cool = require("cool-ascii-faces");
const express = require("express");

var app = express();

//variable para el puerto
var port = process.env.PORT || 80;

//para que podamos usarlo en un html //si hago npm start pero no pongo /cool, me devuelve por defecto el index.html
app.use("/", express.static("./public"));

app.get("/cool", (request, response) => {
    response.send("<html>" +cool()+"</html>");
});

app.listen(port, () => {
    console.log("Servidor listo ",cool())
})