const express = require("express");
const app = express();
const {MongoClient} = require("mongodb");
const cors = require("cors");
const port = 8080;

const mongoURI = "mongodb://localhost:27017";
const dbName = "prof-rating-app";
const collectionName = "profs";


//Middleware test
app.use(express.json()); //for parsing application/json
app.use(cors()); //for configuring Cross-Origin Resource Sharing (CORS)
function log(req, res, next) {
    console.log(req.method + " Request at" + req.url);
    next();
}
app.use(log);

let db;

async function connectToDatabase() {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("Connected to the database");
        db = client.db(dbName);
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
}

connectToDatabase();

//Endpoints
app.get("/profs", async function (req, res) {
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    res.status(200).json(data);
});

app.get("/profs/:id", async function (req, res) {
    const collection = db.collection(collectionName);
    const data = await collection.findOne({ id: parseInt(req.params.id) });
    res.status(200).json(data);
});

app.put("/profs/:id", async function (req, res) {
    const profId = req.params.id;
    const query = {}
    let queryResult = await collection.find(query).toArray();
    const filter = { id: profId };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
          rating: req.body.rating,
        },
      };
    const result = await collection.updateOne(filter, updateDoc, options);
    queryResult = await collection.find(query).toArray();
    res.status(200).send(queryResult);
});

app.delete("/profs/:id", async function (req, res) {
    const collection = db.collection(collectionName);
    const profId = req.params.id;
    const query = {}
    let queryResult = await collection.find(query).toArray();
    const toBeDeleted = queryResult[profId];
    await collection.deleteOne({ id: toBeDeleted.id });
    queryResult = await collection.find(query).toArray();
    res.status(200).json(queryResult);
});

app.post("/profs", async function (req, res) {
    const collection = db.collection(collectionName);
    const newProf = {
        name: req.body.name,
        rating: req.body.rating,
    };
    const result = await collection.insertOne(newProf);
    const query = {};
    const queryResult = await collection.find(query).toArray();
    res.status(200).json(queryResult);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));