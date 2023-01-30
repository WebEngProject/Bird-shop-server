const express = require("express");
const cors = require("cors");
const teachableMachine = require("@sashido/teachablemachine-node");

require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@birdly.ou1diwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/test", async (req, res) => {
  res.send({ message: "hello" });
});

async function run() {
  try {
    const model = new teachableMachine({
      modelUrl: process.env.modelUrl,
    });

    const productsCollection = client.db("birdly").collection("products");
    const familyCollection = client.db("birdly").collection("family");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      let items;
      items = await cursor.toArray();
      console.log(items);
      res.send(items);
    });

    app.get("/family", async (req, res) => {
      const query = {};
      const cursor = familyCollection.find(query);
      let items;
      items = await cursor.toArray();
      console.log(items);
      res.send(items);
    });

    app.post("/classification", async (req, res) => {
      const url = req.body.url;

      console.log(url);

      return model
        .classify({
          imageUrl: url,
        })
        .then((predictions) => {
          console.log(predictions);
          return res.send(predictions);
        })
        .catch((e) => {
          console.error(e);
          res.status(500).send("Something went wrong!");
        });
    });
  } finally {
    /* await client.close(); */
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Birdly Running");
});

app.listen(port, () => {
  client.connect((err) => {
    if (err) console.log(err);
    else console.log("Database Connected Successfully");
  });
  console.log("Birdly running in port ", port);
});
