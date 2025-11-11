import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tji7atp.mongodb.net/?appName=Cluster0`;

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
      try {
        const { search, sort } = req.query;
        const query = {};

        if (search) {
          query.title = { $regex: search, $options: "i" }; // name search
        }

        let sortOption = {};
        if (sort === "price_asc") sortOption.price = 1;
        else if (sort === "price_desc") sortOption.price = -1;
        else if (sort === "date_asc") sortOption.createdAt = 1;
        else if (sort === "date_desc") sortOption.createdAt = -1;
        else sortOption = { createdAt: -1 };

        const properties = await Property.find(query)
          .populate("postedBy", "name email")
          .sort(sortOption);

        res.json(properties);
      } catch (err) {
        res.status(500).json({ message: "Server Error" });
      }
    });

    //Get Single Property by ID
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    });

    //Add New Property
    //Add New Property
    app.post("/properties", async (req, res) => {
      try {
        const newProperty = { ...req.body, createdAt: new Date() };
        const result = await propertyCollection.insertOne(newProperty);
        res.send(result);
      } catch (err) {
        console.error("Error adding property:", err);
        res
          .status(500)
          .send({ error: "Failed to add property", details: err.message });
      }
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
