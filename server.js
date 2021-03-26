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
      if(user.length === 0){
        await registerCollection.insertMany([
            {
              user: req.body.user,
              password: req.body.password,
              dateRegistered: new Date().toISOString().slice(0, 16).replace('T', ' '),
              role: req.body.role
            },
          ]);
        res.send({"success": "User added"});
      }else{
        res.send({"error": "registration not possible"});
      }
  });

  // définir le point d'entrée `GET /` qui retourne tous les utilisateurs
  app.get("/users", async (req, res) => {
      const userId = req.query.id
      if(userId){
        res.send(userId);
      }else{
          res.send(await registerCollection.find().toArray());
      }
  });
  // demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
  app.listen(PORT, () => {
    console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
  });
})();
