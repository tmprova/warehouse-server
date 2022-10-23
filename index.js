const express = require("express");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const cors = require("cors");
const { application } = require("express");
const app = express();
const port = process.env.PORT || 5000;

// middleware====>>
app.use(cors());
app.use(express.json());

// mondodb===>>>

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.srcmy7e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const collection = client.db("warehouseManage").collection("inventory");
    // api data for home && inventory
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = collection.find(query);
      const storage = await cursor.toArray();
      res.send(storage);
    });
    // get item by id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await collection.findOne(query);
      res.send(inventory);
    });

    // update stock
    app.put("/itemAddToStock/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      console.log(data);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          Quatity: data.updatedQuantity,
        },
      };
      const result = await collection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    // app.put("/itemAdd/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const data = req.body;
    //   console.log("from quantity", data);
    //   const filter = { _id: ObjectId(id) };
    //   const option = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       quatity: data.quantity,
    //     },
    //   };
    //   const result = await collection.updateOne(filter, updateDoc, option);
    //   res.send(result);
    // });

    // to post new data
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await collection.insertOne(newItem);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my application");
});

app.listen(port, () => {
  console.log("Listening to port of backend", port);
});
