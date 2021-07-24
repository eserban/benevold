// définir
var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersFindSchema, jwtUserSignSchema, userSchema } = require("../modelsDB.js");
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
   * //la route pour modifier les info du profil
      PUT /android/user :
      Req {
          id_user : id_user ,
          token : token,
          nom : nom,
          address : address,
          city : city,
          number : number,
          email : email,
          picLink : picLink,
      }
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

})();

module.exports = router;