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
       res.send("This is the flutter region"); 
    });

    router.get('/flutter/profiles', (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        const userId = req.query.id ?? null;


        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            const userCollection = await client.db(dbName).collection("flutter_users");
            if(userId) {
                let userOid = new mongo.ObjectID(userId);
                response = await userCollection.find({"_id": userOid}).toArray();
            }
            response = await userCollection.find().toArray();
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
