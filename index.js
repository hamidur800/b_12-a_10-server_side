import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongodb+srv://hamidur800t_db_user:<db_password>@cluster0.tji7atp.mongodb.net/?appName=Cluster0
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("homeNestDB");
    const propertyCollection = database.collection("properties");

    //Get All Properties
    app.get("/properties", async (req, res) => {
      const cursor = propertyCollection.find().sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    //Get Single Property by ID
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    });

    //Add New Property
    app.post("/properties", async (req, res) => {
      const newProperty = { ...req.body, createdAt: new Date() };
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    //Update Property
    app.put("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: updatedData };
      const result = await propertyCollection.updateOne(filter, update);
      res.send(result);
    });

    //Delete Property
    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.send(result);
    });

    console.log("MongoDB Connected Successfully");
  } finally {
  }
}
run().catch(console.dir);

// Root Route
app.get("/", (req, res) => {
  res.send("HomeNest Server is Running...");
});

// Listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
