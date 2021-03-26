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

  // définir le point d'entrée `POST /` pour l'enregistrement d'un nouvel utilisateur
  app.post("/register", async (req, res) => {
      const user = await registerCollection.find({"user": req.body.user}).toArray();
      console.log(typeof user);
      if(user === []){
        await registerCollection.insertMany([
            {
              user: req.body.user,
              password: req.body.password,
              dateRegistered: new Date(),
              role: req.body.role
            },
          ]);
      }
    res.send(user);
  });

  app.get("/get/all/users", async (req, res) => {
    res.send(await registerCollection.find().toArray());
  });
  // demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
  app.listen(PORT, () => {
    console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
  });
})();
