const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Warehouse Server is Running...")
})


//----------MongoDb Info----------\\
const uri = `mongodb+srv://${process.env.MD_USER}:${process.env.MD_PASS}@inventory1.jwkvque.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function  run(){
    try{
        await client.connect();
        
        const inventoryCollection = client.db("inventoryData").collection("products");

        app.get('/products', async (req, res) => {
            const product = inventoryCollection.find({});
            let result = await product.toArray();
            res.send(result);
        })

        app.post('/addproducts', async(req, res) => {
            const query = req.body;
            const result = await inventoryCollection.insertOne(query);
            res.send(result);
        })

        app.delete('/deleteItem/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await inventoryCollection.deleteOne(query);
            res.send(result)
            
        })

        app.get('/productitemInfo/:id', async(req, res) => {
            const query = req.params.id;
            const items = {_id: ObjectId(query)};
            const result = await inventoryCollection.findOne(items);
            res.send(result);
        })

        app.put('/updateQuantity/:id', async(req, res) => {
            const id = req.params.id;
            const quantity = req.body.quantity;
            const query = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {$set: {quantity: quantity }};
            const result = await inventoryCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })

    }finally{

    }
}

run().catch(console.dir);








app.listen(port, () => {
    console.log("Listen Port", port)
})
