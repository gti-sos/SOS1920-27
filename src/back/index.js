const dataStore = require("nedb");
const path = require('path');
const baseApi = "/api/v1";

const dbFileName = path.join(__dirname, 'contacts.json');

const db = new dataStore({
    filename: dbFileName,
    autoload: true
});


module.exports = function (app) {

    console.log("DB initialized");

    db.find({}, (err, contacts) => {
        if (contacts.length == 0) {
            db.insert([{
                    name: "pedro",
                    phone: 12345678,
                    email: "pedro@pedro.com"
                },
                {
                    name: "pepe",
                    phone: 5678323,
                    email: "pepe@pepe.com"
                },
            ]);
            console.log("EMPTY DB! Inserted 2 default contacts");
        } else {
            console.log("Loaded DB with " + contacts.length + " contacts");
        }
    });

    app.get(baseApi + "/contacts", (req, res) => {
        console.log("New GET request over /contacts");
        db.find({}, (err, contacts) => {
            if (err) {
                res.sendStatus(500);
            } else {
                res.send(contacts);
              /*  setTimeout(function () {
                    res.send(contacts);
                }, 2000); */
            }
        })
    });


    app.get(baseApi + "/contacts/:name", (req, res) => {

        var name = req.params.name;
        console.log("New GET request over /contact/" + name);

        db.find({
            name: name
        }, (err, contacts) => {
            if (err) {
                res.sendStatus(500);
            } else {
                if (contacts.length > 0)
                    res.send(contacts[0]);
                else
                    res.sendStatus(404);
            }
        })
    });

    app.delete(baseApi + "/contacts/:name", (req, res) => {

        var name = req.params.name;
        console.log("New DELETE request over /contact/" + name);

        db.remove({
            name: name
        }, {}, (err, numRemoved) => {
            if (err) {
                res.sendStatus(500);
            } else {
                console.log("Deleted " + numRemoved + " objects");
                res.sendStatus(200);
            }
        })
    });

    app.put(baseApi + "/contacts/:name", (req, res) => {

        var name = req.params.name;
        var contact = req.body;

        console.log("New PUT request over /contact/" + name);
        console.log("Data: " + JSON.stringify(contact, 2));

        if (name != contact.name) {
            res.sendStatus(409);
            return;
        }

        db.update({
            name: name
        }, contact, (err, numUpdates) => {
            if (err) {
                res.sendStatus(500);
            } else {
                console.log("Updated " + numUpdates + " objects");
                res.sendStatus(200);
            }
        })
    });



    app.post(baseApi + "/contacts", (req, res) => {
        console.log("New POST request over /contacts");
        var contact = req.body;
        console.log("Contact to be inserted: " + JSON.stringify(req.body, null, 2));
        db.insert(contact);
        console.log("done");
        res.sendStatus(201);
    });





};