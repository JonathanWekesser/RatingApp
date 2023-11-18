require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.COSMOS_CONNECTION_STRING;
const client = new MongoClient(url);

const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const port = 8080;
const filename = __dirname + "/profs.json";

//Middleware test
app.use(express.json()); //for parsing application/json
app.use(cors()); //for configuring Cross-Origin Resource Sharing (CORS)
function log(req, res, next) {
    console.log(req.method + " Request at" + req.url);
    next();
}
app.use(log);

async function initDB(){
    await client.connect();
    const db = client.db(`prof-rating-app`);
    console.log(`New database:\t${db.databaseName}\n`);
    const collection = db.collection('profs');
    console.log(`New collection:\t${collection.collectionName}\n`);
    
}

// new Endpoints
async function getProfs() {

}

async function addProfs(req, res) {
    let professor = {
        name: req.body.name,
        rating: req.body.rating,
    };
    const query = { name: professor.name, rating: professor.rating };
    const update = { $set: professor };
    const options = {upsert: true, new: true};
    const upsertProfessor = await collection.updateOne(query, update, options);
    console.log(`upsertProfessor: ${JSON.stringify(upsertProfessor)}\n`);
}

//Endpoints
app.get("/profs", function (req, res) {
    getProfs();
});

app.get("/profs/:id", function (req, res) {
    fs.readFile(filename, "utf8", function (err, data) {
        const dataAsObject = JSON.parse(data)[req.params.id];
        res.writeHead(200, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify(dataAsObject));
    });
});

app.put("/profs/:id", function (req, res) {
    fs.readFile(filename, "utf8", function (err, data) {
        let dataAsObject = JSON.parse(data);
        dataAsObject[req.params.id].name = req.body.name;
        dataAsObject[req.params.id].rating = req.body.rating;
        fs.writeFile(filename, JSON.stringify(dataAsObject), () => {
            res.writeHead(200, {
                "Content-Type": "application/json",
            });
            res.end(JSON.stringify(dataAsObject));
        });
    });
});

app.delete("/profs/:id", function (req, res) {
    fs.readFile(filename, "utf8", function (err, data) {
        let dataAsObject = JSON.parse(data);
        dataAsObject.splice(req.params.id, 1);
        fs.writeFile(filename, JSON.stringify(dataAsObject), () => {
            res.writeHead(200, {
                "Content-Type": "application/json",
            });
            res.end(JSON.stringify(dataAsObject));
        });
    });
});

app.post("/profs", function (req, res) {
    /*
    fs.readFile(filename, "utf8", function (err, data) {
        let dataAsObject = JSON.parse(data);
        dataAsObject.push({
            id: dataAsObject.length,
            name: req.body.name,
            rating: req.body.rating,
        });
        fs.writeFile(filename, JSON.stringify(dataAsObject), () => {
            res.writeHead(200, {
                "Content-Type": "application/json",
            });
            res.end(JSON.stringify(dataAsObject));
        });
    });
    */
   addProfs(req, res);
});

initDB();
app.listen(port, () => console.log(`Server listening on port ${port}!`));