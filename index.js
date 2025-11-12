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

const uri = `mongodb+srv://Atlas_User_db:rulpqZXfDhwBzwWm@cluster0.tji7atp.mongodb.net/?appName=Cluster0`;

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
    // GET all properties with search & sort
    app.get("/properties", async (req, res) => {
      try {
        const { search, sort } = req.query;
        const query = {};

        if (search) query.propertyName = { $regex: search, $options: "i" };

        let sortOption = {};
        if (sort === "price_asc") sortOption.price = 1;
        else if (sort === "price_desc") sortOption.price = -1;
        else if (sort === "date_asc") sortOption.createdAt = 1;
        else sortOption = { createdAt: -1 };

        const properties = await propertyCollection
          .find(query)
          .sort(sortOption)
          .toArray();
        res.json(properties || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
      }
    });

    // POST new property
    app.post("/properties", async (req, res) => {
      try {
        const newProperty = { ...req.body, createdAt: new Date() };
        const result = await propertyCollection.insertOne(newProperty);
        res.json(result);
      } catch (err) {
        console.error("Error adding property:", err);
        res
          .status(500)
          .json({ message: "Failed to add property", error: err.message });
      }
    });

    //Get Single Property by ID
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
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

    // GET /properties?email=user@example.com
    app.get("/properties", async (req, res) => {
      try {
        const { email } = req.query;
        let query = {};
        if (email) query["postedBy.email"] = email;

        const properties = await Property.find(query).sort({ createdAt: -1 });
        res.json(properties);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // DELETE /properties/:id
    app.delete("/properties/:id", async (req, res) => {
      try {
        const deleted = await Property.findByIdAndDelete(req.params.id);
        if (!deleted)
          return res.status(404).json({ message: "Property not found" });
        res.json({ message: "Deleted successfully" });
      } catch (err) {
        res.status(500).json({ message: "Server Error" });
      }
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
