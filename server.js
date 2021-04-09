const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { userSchema, jwtSignSchema } = require("./modelsDB.js");
const PORT = process.env.PORT || 3000;

const dbName = "benevold_db";

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  await client.connect();

  // instancier le serveur applicatif "express"
  const app = express();
  app.use(express.json());

  // définir le point d'entrée `POST /` pour l'enregistrement d'un nouvel utilisateur
  app.post("/register", async (req, res) => {
    const password = req.body.password ?? null;
    const email = req.body.email ?? null;
    const firstName = req.body.firstName ?? null;
    const lastName = req.body.lastName ?? null;
    const role = req.body.role ?? "user";

    const emailRegex = /^\S+@\S+$/;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let token           = null;

    const userCollection    = await client.db(dbName).collection("users");
    const user              = await userCollection.find({"email": email}).toArray();

    if(!firstName || !lastName || !password || !emailRegex.test(email))
      {
          success         = false;
          code            = 400;
          errorMessage    = "Un Nom, un Prenom, une adresse mail valide ainsi qu'un mot de passe sont requis."
      }else if(password.length < 4)
      {
          success         = false;
          code            = 400;
          errorMessage    = "Le mot de passe doit contenir au moins 4 catactères."
          
      }else if (user.length > 0)
      {
          success         = false;
          code            = 400;
          errorMessage    = "Cet email est déjà associé à un compte";
      }

      if(success)
      {
        //If body request is OK, password hash and adding user to db
        const saltRound = 10;
        let hashedPw = await bcrypt.hash(password,saltRound);
        await userCollection.insertOne(userSchema(firstName, lastName, email, password, role));

        //Récupératon du nouvel user crée
        const newUser =  await userCollection.find({"email": email}).limit(1).toArray();

        let tokenSignSchema = jwtSignSchema(newUser._id, newUser.firstName, newUser.lastName, newUser.role);

        token = jwt.sign(tokenSignSchema, process.env.JWT_KEY || "testENCODE", {
            expiresIn: 86400 // expires in 24 hours
        });

      }

      const data = {
        "success": success,
        "reauestCode": code,
        "error": errorMessage,
        "token" : token
      };

      res.status(code).send(data);
  });

  app.post("/signin", async (req, res) => {

  });

  

  // définir le point d'entrée `GET /` qui retourne tous les utilisateurs ou l'utilisateur en fonction de ce qui est envoyé
  app.get("/users", async (req, res) => {
    
  });

  // demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
  app.listen(PORT, () => {
    console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
  });
})();
