const express = require("express");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const jwt = require("jsonwebtoken");

const cors = require("cors");
const { application } = require("express");
const app = express();
const port = process.env.PORT || 5000;

// middleware====>>
app.use(cors());
app.use(express.json());

// JSON WEB TOKEN
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(404).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

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

    // delivered inventory

    app.put("/itemDelivered/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      console.log(data);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          Quatity: data.Quatity - 1,
        },
      };
      const result = await collection.updateOne(filter, updateDoc, option);
      res.send(result);
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

    // to post new data to my item
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await collection.insertOne(newItem.data);
      res.send(result);
    });

    // jwt auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "3d",
      });
      res.send({ accessToken });
    });

    // get my items

    app.get("/myitems", verifyJWT, async (req, res) => {
      const decodedEmail = req?.decoded?.email;
      const email = req?.query?.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    // delete inventory
    app.delete("/inventoryDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await collection.deleteOne(query);
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
