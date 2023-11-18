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
    res.json(data);
});

app.get("/profs/:id", async function (req, res) {
    const collection = db.collection(collectionName);
    const data = await collection.findOne({ _id: parseInt(req.params.id) });
    res.json(data);
});

app.put("/profs/:id", async function (req, res) {
    const collection = db.collection(collectionName);
    const updatedProf = {
        name: req.body.name,
        rating: req.body.rating,
    };
    const result = await collection.updateOne({ _id: parseInt(req.params.id) }, { $set: updatedProf });
    res.json({ message: `${result.modifiedCount} prof(s) updated` });
    
});

app.delete("/profs/:id", async function (req, res) {
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: parseInt(req.params.id) });
    res.json({ message: `${result.deletedCount} prof(s) deleted` });
});

app.post("/profs", async function (req, res) {
    const collection = db.collection(collectionName);
    const newProf = {
        name: req.body.name,
        rating: req.body.rating,
    };

    try {
        const result = await collection.insertOne(newProf);

        if (result.ops && result.ops.length > 0) {
            res.json(result.ops[0]);
        } else {
            res.status(500).json({ error: "Failed to insert document" });
        }
    } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).json({ error: "Failed to insert document" });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));