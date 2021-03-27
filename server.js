const express = require("express");
const PORT = process.env.PORT || 3000;

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const authRoute = require('./routes/auth.js');

(async () => {
  await client.connect();
  const registerCollection = client.db("test").collection("connection");

  // instancier le serveur applicatif "express"
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRoute);

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
