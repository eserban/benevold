// définir
var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersFindSchema, annonceSchema,sortByDate } = require("../modelsDB.js");
var router = express.Router();
let dbName = "benevold_db"

const MongoClient = require("mongodb").MongoClient;
const mongo = require("mongodb");
const uri = process.env.MONGO_URI || "mongodb+srv://admin-benevold:MaqLBQjdNLmm6b4R@cluster0.qf07i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async() => {

  await client.connect();


  router.post('/user', async (req, res) => {
    const token = req.header('access-token') ?? null;

    const userId = req.body.user_id ?? null;
    let userOid = new mongo.ObjectID(userId);

    const type = req.query.type == "android" ? "old" : "teen";
  
    let tokenObject = null;
    let userEmail = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    const userCollection    = await client.db(dbName).collection("users");
    const projection = usersFindSchema();
    const user              = await userCollection.find({"_id": userOid, 'type': type}).project(projection).limit(1).toArray();

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!userId){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informationde l'utilisateur"
    }else if(user.length == 0){
      success         = false;
      code            = 402; 
      errorMessage    = "Cet utilisateur n'a pas été trouvé";
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if (success) {
      response = user[0];
    }

    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage,
      "response" : response
    };

    res.status(code).send(data);
      
  });

  /**
   * la route pour modifier les info du profil
   */

  router.put('/user', async (req, res) => {
    const token = req.header('access-token') ?? null;

    const userId = req.body.id_user ?? null;
    let userOid = new mongo.ObjectID(userId);
    const fullName = req.body.nom ?? null;
    const address = req.body.address ?? null;
    const city = req.body.city ?? null;
    const phoneNumber = req.body.number ?? null;
    const email = req.body.email ?? null;
    const picLink = req.body.picLink ?? null;

    const type = req.query.type == "android" ? "old" : "teen";

    let tokenObject = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    const userCollection    = await client.db(dbName).collection("users");
    const user              = await userCollection.find({"_id": userOid, 'type': type}).limit(1).toArray();

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!userId || !fullName || !address || !city || !phoneNumber || !email || !picLink){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informations de l'utilisateur"
    }else if(user.length == 0){
      success         = false;
      code            = 402; 
      errorMessage    = "Cet utilisateur n'a pas été trouvé";
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if (success) {
      await userCollection.updateOne({"_id": userOid, "type": type}, {$set: {"fullName": fullName, "adress": address, "city": city, "phoneNumber": phoneNumber, "email": email, "picLink": picLink}});
    }


    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage
    };

    res.status(code).send(data);  
  });

  /**
   * //la route pour créer une annonce
  */
  router.put('/annonce', async (req, res) => {
    const token = req.header('access-token') ?? null;
    
    const userId = req.body.user_id ?? null;
    const title = req.body.title ?? null;
    const category = req.body.category ?? null;
    const description = req.body.description ?? null;
    const phone = req.body.phone ?? null;
    const email = req.body.email ?? null;
    const contact = req.body.contact ?? null;
    const address = req.body.address ?? null;
    const date = req.body.date ?? null;
    const time = req.body.time ?? null;

    const type = req.query.type == "android" ? "old" : "teen";


    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!userId || !title || !category || !description || !phone || !contact || !email || !address || !date || !time){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informations de l'annonce"
    }else if(type == "teen"){
      success         = false;
      code            = 402; 
      errorMessage    = "Il faut etre un utilisateur android pour créer une annonce";
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if (success) {
      const annoncesCollection = await client.db(dbName).collection("annonces");
      await annoncesCollection.insertOne(annonceSchema(userId, title, category, description, phone, email, contact, address, date, time));
    }


    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage
    };

    res.status(code).send(data); 
  });

  /**
   * la route pour recuperer les infos d'annonce
   */

  router.post('/annonce', async (req, res) => {
    const token = req.header('access-token') ?? null;

    const annonceId = req.body.annonce_id ?? null;
    let annonceOid = new mongo.ObjectID(annonceId);
  
    let tokenObject = null;
    let userEmail = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    const annoncesCollection    = await client.db(dbName).collection("annonces");
    const annonce              = await annoncesCollection.find({"_id": annonceOid}).toArray();

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!annonceId){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informations de l'annonce"
    }else if(annonce.length == 0){
      success         = false;
      code            = 402; 
      errorMessage    = "Cette annonce n'a pas été trouvé";
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if (success) {
      response = annonce[0];
    }

    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage,
      "response" : response
    };

    res.status(code).send(data);
  });


  /**
   * //la route pour recuperer tout les annonces du profil
   */

  router.post('/annonces', async(req, res)=> {
    const token = req.header('access-token') ?? null;

    const userId = req.body.user_id ?? null;
  
    let tokenObject = null;
    let userEmail = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    const annoncesCollection    = await client.db(dbName).collection("annonces");
  
    const annonce              = await annoncesCollection.find({"user_id": userId}).sort(sortByDate()).toArray();

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!userId){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informations de l'utilisateur"
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if (success) {
      response = annonce
    }



    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage,
      "response" : response
    };

    res.status(code).send(data);

  });


  /**
   * //la route pour changer le status de l'annonce en "terminé" 
   */
  router.post('/annonce/status', async(req, res)=> {
    const token = req.header('access-token') ?? null;

    const annonceId = req.body.annonce_id ?? null;
    let annonceOid = new mongo.ObjectID(annonceId);

    let tokenObject = null;
    let userEmail = null;

    let success         = true;
    let code            = 200;
    let errorMessage    = null;
    let response        = [];

    const annoncesCollection    = await client.db(dbName).collection("annonces");
    const annonce              = await annoncesCollection.find({"_id": annonceOid}).toArray();

    if(!token){
      success         = false;
      code            = 403; 
      errorMessage    = "Authentification Failed"
    }else if(!annonceId){
      success         = false;
      code            = 400; 
      errorMessage    = "Veuillez introduire les informations de l'annonce"
    }else if(annonce.length == 0){
      success         = false;
      code            = 402; 
      errorMessage    = "Cette annonce n'a pas été trouvé";
    }else{
      tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
      if(!tokenObject){
        success         = false;
        code            = 500;
        errorMessage    = "An error has occurred";
      }
    }

    if(success) {
      await annoncesCollection.updateOne({ "_id":annonceOid}, {$set: {"status": "terminé"}});
    }

    const data = {
      "success": success,
      "requestCode": code,
      "error": errorMessage
    };

    res.status(code).send(data);

  });

  /**
   * //la route pour recuperer le message du jour
      GET /message :
      RES {
          message : message
      }
   */

      router.get('/message', (req, res) => {
        const token = req.header('access-token') ?? null;

        let success         = true;
        let code            = 200;
        let errorMessage    = null;
        let response        = [];

        if(!token){
          success         = false;
          code            = 403; 
          errorMessage    = "Authentification Failed"
        }else{
          tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
          if(!tokenObject){
            success         = false;
            code            = 500;
            errorMessage    = "An error has occurred";
          }
        }

        if (success) {
          const messageCollection = await client.db(dbName).collection('message');
          let message = await messageCollection.find().toArray();
          response = message[0];
        }
        
        const data = {
          "success": success,
          "requestCode": code,
          "error": errorMessage,
          "response" : response
        };
    
        res.status(code).send(data);
      });


})();

module.exports = router;