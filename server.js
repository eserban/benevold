const express = require("express");
const { userSchema } = require("modelsDB.js").userSchema;
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
          userSchema(req.body.user, req.body.password, req.body.role)
        ]);
        res.send({"success": "User added"});
      }else{
        res.send({"error": "registration not possible"});
      }
  });

  // définir le point d'entrée `GET /` qui retourne tous les utilisateurs ou l'utilisateur en fonction de ce qui est envoyé
  app.get("/users", async (req, res) => {
    const userName = req.query.user
    if(userName){
        res.send(await registerCollection.find({ "user": userName }).toArray());
    }else{
        res.send(await registerCollection.find().toArray());
    }
  });

  // demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
  app.listen(PORT, () => {
    console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
  });
})();
