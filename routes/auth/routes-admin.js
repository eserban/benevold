// définir
var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, jwtAdminSignSchema, usersFindSchema } = require("../../modelsDB.js");
var router = express.Router();
let dbName = "benevold_db"

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI || "mongodb+srv://admin-benevold:MaqLBQjdNLmm6b4R@cluster0.qf07i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// définir le point d'entrée `POST /` pour l'enregistrement d'un nouvel utilisateur
router.post("/add", async (req, res) => {
    await client.connect();
    const password = req.body.password ?? null;
    const email = req.body.email ?? null;

    const emailRegex = /^\S+@\S+$/;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;

    const userCollection    = await client.db(dbName).collection("admin_users");
    const user              = await userCollection.find({"email": email}).toArray();

    if(!password || !emailRegex.test(email))
      {
          success         = false;
          code            = 400;
          errorMessage    = "Une adresse mail valide ainsi qu'un mot de passe sont requis."
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
        let hashedPwd = await bcrypt.hash(password,saltRound);
        await userCollection.insertOne(userAdminSchema(email, hashedPwd));
      }

      const data = {
        "success": success,
        "requestCode": code,
        "error": errorMessage
      };

      res.status(code).send(data);
  });

  router.post("/signin", async (req, res) => {
    await client.connect();
    try{
      const email = req.body.email ?? null;
      const password = req.body.password ?? null;

      let success         = true;
      let code            = 200;
      let errorMessage    = null;
      let token           = null;

    const userCollection    = await client.db(dbName).collection("users");
    const user              = await userCollection.find({"email": email}).limit(1).toArray();

    const match = bcrypt.compare(password, user[0].password);

    if(!email || !password)
      {
          success         = false;
          code            = 400;
          errorMessage    = "Une adresse mail valide ainsi qu'un mot de passe sont requis."
      }else if (user.length < 1)
      {
          success         = false;
          code            = 404;
          errorMessage    = "Cet email n'est associé à aucun compte";
      }else if (!match){
        success           = false;
        code              = 400;
        errorMessage      = "Le mot de passe est pas valide";
      }

      if(success){
        //if body entries are OK we generate a token for the user
        let tokenSignSchema = jwtAdminSignSchema(user[0]._id, user[0].email);
        
        token = jwt.sign(tokenSignSchema, process.env.JWT_KEY || "testENCODE", {
            expiresIn: 86400 // expires in 24 hours
        });
      }

      const data = {
        "success": success,
        "requestCode": code,
        "error": errorMessage,
        "token" : token
      };

      res.status(code).send(data);
    }catch(err){
      console.error(err);
    }

  });
  // définir le point d'entrée `GET /` qui retourne tous les utilisateurs ou l'utilisateur en fonction de ce qui est envoyé
  router.get("/users", async (req, res) => {
    await client.connect();
    const token = req.header('access-token') ?? null;
    const userId = req.query.id ?? null;

    let tokenObject = null;
    let userEmail = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];
    
    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY || "testENCODE") ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if(success){
      userEmail = tokenObject.email;
      const userCollection    = await client.db(dbName).collection("admin_users");
      const projection = usersFindSchema();
      if(userId){
        response              = await userCollection.find({ "_id": userId }).project(projection).toArray();
      }
      response                = await userCollection.find().project(projection).toArray();
    }


    const data = {
      "account": userEmail,
      "success": success,
      "requestCode": code,
      "error": errorMessage,
      "response" : response
    };

    res.status(code).send(data);

  });

  module.exports = router;