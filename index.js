const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Warehouse Server is Running...");
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorization Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

//----------MongoDb Info----------\\
const uri = `mongodb+srv://${process.env.MD_USER}:${process.env.MD_PASS}@inventory1.jwkvque.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const inventoryCollection = client
      .db("inventoryData")
      .collection("products");

    app.get("/products", async (req, res) => {
      const product = inventoryCollection.find({});
      let result = await product.toArray();
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.post("/addproducts", async (req, res) => {
      const query = req.body;
      const result = await inventoryCollection.insertOne(query);
      res.send(result);
    });

    app.delete("/deleteItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/productitemInfo/:id", async (req, res) => {
      const query = req.params.id;
      const items = { _id: ObjectId(query) };
      const result = await inventoryCollection.findOne(items);
      res.send(result);
    });

    app.put("/updateQuantity/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = req.body.quantity;
      const sold = req.body.sold;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = { $set: { quantity: quantity, sold: sold } };
      const result = await inventoryCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const upProduct = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: upProduct };
      const result = await inventoryCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/getmyitems", verifyJWT, async (req, res) => {
      const decoded = req.decoded.userEmails;
      const userEmail = req.query.email;
      if (decoded !== userEmail) {
        return res.status(403).send({ message: "Forbiddedn Access" });
      }
      const query = { email: userEmail };
      const result = await inventoryCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("Listen Port", port);
});
