var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, jwtAdminSignSchema, usersFindSchema, jelloProjectsSchema, jelloTasksSchema } = require("../../modelsDB.js");
let router = express.Router();
let dbName = "benevold_db"

const MongoClient = require("mongodb").MongoClient;
const mongo = require("mongodb");
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

(async () => {
    await client.connect();


    router.get('/', (req, res) => {
        res.send("This is the iOS region"); 
    });


    router.get('/ios/user', async (req, res) => {
        // const token = req.header('access-token') ?? null;

        let id = req.query.id ?? null;
        let userOid = new mongo.ObjectID(id);

        let success         = true;
        let code            = 200;
        let errorMessage    = null;
        let response = [];

        const usersCollection    = await client.db(dbName).collection("users");
        const user              = await usersCollection.find({"_id": userOid}).toArray();

        // if (!token) {
        //     success = false;
        //     code = 400;
        //     errorMessage = "Authentification Failed";
        // }else 
        if (!id) {
            success = false;
            code = 401;
            errorMessage = "Veuillez entrer l'id de l'utilisateur";
        } else if (user.length == 0) {
            success = false;
            code = 402;
            errorMessage = "Cet utilisateur n'a pas été trouvé";
        } 
        // else {
        //     tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
        //     if (!tokenObject) {
        //         success = false;
        //         code = 500;
        //         errorMessage = "Your connection token is no more valid";
        //     }
        // }

        if  (success) {
            response = user;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });
})();

module.exports = router;