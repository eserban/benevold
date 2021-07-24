// définir
var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersFindSchema, jwtUserSignSchema, userSchema } = require("../../modelsDB.js");
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


    router.get('/', (req, res) => {
        res.send("This is the user authentification region"); 
    });

    router.post("/signin", async (req, res) => {
        try{
            const login = req.body.login ?? null;
            const password = req.body.password ?? null;

            const type = req.query.type == "android" ? "old" : "teen";
            console.log(type);

            let success         = true;
            let code            = 200;
            let errorMessage    = null;
            let token           = null;

            const userCollection    = await client.db(dbName).collection("users");
            const user              = await userCollection.find({"email": login, "type": type }).limit(1).toArray();

            if(!login || !password)
            {
                success         = false;
                code            = 400;
                errorMessage    = "Une adresse mail valide ainsi qu'un mot de passe sont requis."
            }else if (user.length < 1)
            {
                success         = false;
                code            = 404;
                errorMessage    = "Cet email n'est associé à aucun compte";
            }else if (!bcrypt.compare(password, user[0].password)){
                success           = false;
                code              = 400;
                errorMessage      = "Le mot de passe est pas valide";
            }

            if(success){
                //if body entries are OK we generate a token for the user
                let tokenSignSchema = jwtUserSignSchema(user[0]._id, user[0].email, user[0].type);
                
                token = jwt.sign(tokenSignSchema, process.env.JWT_KEY, {
                    expiresIn: 86400 // expires in 24 hours
                });
            }

            const data = {
                "success": success,
                "requestCode": code,
                "error": errorMessage,
                "token" : token,
                "user_id": user[0]._id
            };

            res.status(code).send(data);
        }catch(err){
            console.error(err);
        }

    });

    router.post('/signup', async(req, res) => {

        const fullName = req.body.fullName ?? null;
        const email = req.body.email ?? null;
        const phoneNumber = req.body.telNumber ?? "";
        const address = req.body.adress ?? "";
        const postalCode = req.body.postalCode ?? "";
        const city = req.body.city ?? "";
        const picLink = req.body.picLink ?? "";
        const password = req.body.password ?? null;
        const type = req.query.type == "android" ? "old" : "teen";


        const emailRegex = /^\S+@\S+$/;


        let success         = true;
        let code            = 200;
        let errorMessage    = null;
        let token = null;

        response = null;

        const userCollection    = await client.db(dbName).collection("users");
        const user              = await userCollection.find({"email": email, "type": type}).toArray();

        if(!password || !email || !fullName)
        {
            success         = false;
            code            = 400;
            errorMessage    = "Veuillez reiseigner toutes les informations du nouveau compte";
        }else if(password.length < 4)
        {
            success         = false;
            code            = 401;
            errorMessage    = "Le mot de passe doit contenir au moins 4 catactères."
            
        }else if (user.length > 0)
        {
            success         = false;
            code            = 402;
            errorMessage    = "Cet email est déjà associé à un compte";
        }

        if(success)
        {
            //If body request is OK, password hash and adding user to db
            const saltRound = 10;
            let hashedPwd = await bcrypt.hash(password,saltRound);
            await userCollection.insertOne(userSchema(fullName, email, phoneNumber, address, postalCode, city, hashedPwd, type, picLink));

            let userOnceAdded = await userCollection.find({"fullName": fullName, "email": email}).toArray();

            //if body entries are OK we generate a token for the user
            let tokenSignSchema = jwtUserSignSchema(userOnceAdded[0]._id, userOnceAdded[0].email, userOnceAdded[0].type);
                
            token = jwt.sign(tokenSignSchema, process.env.JWT_KEY, {
                expiresIn: 86400 // expires in 24 hours
            });

            response = userOnceAdded[0]._id;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "user_id": response,
            "token": token,
        };

        res.status(code).send(data);
    });

    /**
     * POST /android/password/email :
     */
    router.post('/password/email', async (req, res) => {

        const email = req.body.email ?? null;

        const type = req.query.type == "android" ? "old" : "teen";


        let success         = true;
        let code            = 200;
        let errorMessage    = null;

        response = null;

        const userCollection    = await client.db(dbName).collection("users");
        const user              = await userCollection.find({"email": email, "type": type}).toArray();

        if(!email)
        {
            success         = false;
            code            = 400;
            errorMessage    = "Veuillez reinseigner l'email de l'utilisateur";
        }else if (user.length == 0)
        {
            success         = false;
            code            = 402;
            errorMessage    = "Cet email est associé à aucun compte";
        }


        if(success)  {
            response = user[0]._id;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "user_id": response
        };

        res.status(code).send(data);

    });

    /**
     * PUT /android/password/new :
     * 
     *           Req {
            id_user : id_user ,
            new_password : new_password
        }

     */

     router.post('/password/new', async (req, res) => {
        const type = req.query.type == "android" ? "old" : "teen";

        let userId = req.body.user_id ?? null;
        let userOid = new mongo.ObjectID(userId);
        let newPassword = req.body.new_password ?? null;

        let success         = true;
        let code            = 200;
        let errorMessage    = null;

        response = null;

        const userCollection    = await client.db(dbName).collection("users");
        const user              = await userCollection.find({"_id": userOid, "type": type}).toArray();

        if(!userId || !newPassword)
        {
            success         = false;
            code            = 400;
            errorMessage    = "Veuillez reinseigner l'id de l'utilisateur et le nouveau password";
        }else if (user.length == 0)
        {
            success         = false;
            code            = 402;
            errorMessage    = "Cet id est associé à aucun compte";
        }

        if(success) {
            const saltRound = 10;
            let hashedPwd = await bcrypt.hash(newPassword,saltRound);

            await userCollection.updateOne({ "_id": userOid, "type": type}, {$set:{"password": hashedPwd}});
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