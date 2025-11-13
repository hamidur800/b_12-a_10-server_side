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
    const ratingCollection = database.collection("ratings");

    //Get All Properties with Search and Sort
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
        const id = req.params.id;
        console.log("Deleting property with ID:", id);

        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .send({ message: "Invalid property ID format" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await propertyCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Property deleted successfully" });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Property not found" });
        }
      } catch (error) {
        console.error(" Error deleting property:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete property",
          error: error.message,
        });
      }
    });

    // GET property by ID
    app.get("/properties/:id", async (req, res) => {
      const { id } = req.params;
      try {
        if (!ObjectId.isValid(id))
          return res.status(400).send({ error: "Invalid ID" });
        const property = await propertyCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!property)
          return res.status(404).send({ error: "Property not found" });
        res.send(property);
      } catch (err) {
        console.error("Error fetching property:", err);
        res.status(500).send({ error: "Failed to fetch property" });
      }
    });

    app.post("/properties", async (req, res) => {
      try {
        const newProperty = { ...req.body, createdAt: new Date() };
        const result = await propertyCollection.insertOne(newProperty);
        // return the actual property data
        res.json({ ...newProperty, _id: result.insertedId });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ message: "Failed to add property", error: err.message });
      }
    });

    app.get("/ratings/user", async (req, res) => {
      const { email } = req.query;
      if (!email) return res.status(400).send({ error: "Email required" });

      try {
        const ratings = await ratingCollection
          .find({ reviewerEmail: email })
          .toArray();
        res.send(ratings);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch ratings" });
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
