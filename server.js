const express = require("express");
const PORT = process.env.PORT || 3000;

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  await client.connect();
  const registerCollection = client.db("test").collection("connection");

  // instancier le serveur applicatif "express"
  const app = express();
  app.use(express.json());

  // définir le point d'entrée `GET /` qui répond "Bonjour !" à chaque requête reçue
  app.post("/register", (req, res) => {
    await collection.insertMany([
        {
          from: "user",
          msg: req.body.msg,
        },
        {
          from: "password",
          msg: réponse,
        },
        {
            from: "date-registration",
            msg: new Date(),
          },
      ]);
    res.send(collection.find().toArray());
  });

  app.get("/get/all/users", (req, res) => {
        res.send(registerCollection.find().toArray());
  });
  // demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
  });
})();
