// définir
var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, usersFindSchema, jwtUserSignSchema, userSchema } = require("../../modelsDB.js");
var router = express.Router();
let dbName = "benevold_db"

const MongoClient = require("mongodb").MongoClient;
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
            const email = req.body.email ?? null;
            const password = req.body.password ?? null;

            const type = req.query.type == "android" ? "old" : "teen";
            console.log(type);

            let success         = true;
            let code            = 200;
            let errorMessage    = null;
            let token           = null;

            const userCollection    = await client.db(dbName).collection("users");
            const user              = await userCollection.find({"email": email, "type": type }).limit(1).toArray();

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
                "token" : token
            };

            res.status(code).send(data);
        }catch(err){
            console.error(err);
        }

    });

    router.post('/signup', async(req, res) => {


        const username = req.body.username ?? null;
        const email = req.body.mail ?? null;
        const phoneNumber = req.body.telNumber ?? null;
        const address = req.body.adress ?? null;
        const postalCode = req.body.postalCode ?? null;
        const city = req.body.city ?? null;
        const password = req.body.password ?? null;
        const type = req.query.type == "android" ? "old" : "teen";


        const emailRegex = /^\S+@\S+$/;

        let success         = true;
        let code            = 200;
        let errorMessage    = null;

        const userCollection    = await client.db(dbName).collection("users");
        const user              = await userCollection.find({"username": username, "type": type}).toArray();

        if(!password || !emailRegex.test(email) || !username || !phoneNumber 
            || !address || !postalCode || !city || !type)
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
            await userCollection.insertOne(userSchema(username, email, phoneNumber, address, postalCode, city, hashedPwd, type));
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