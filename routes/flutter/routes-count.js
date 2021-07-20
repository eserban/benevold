var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, jwtAdminSignSchema, usersFindSchema, jelloProjectsSchema, jelloTasksSchema } = require("../../modelsDB.js");
const countRoutes = require('./routes-count.js');
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


    // router.get('/', (req, res) => {
    //    res.send("This is the flutter region"); 
    // });

    router.get('/all/users', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = 0;

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
            const projection = usersFindSchema();
            const iosUsersCollection = await client.db(dbName).collection("ios_users");
            const androidUsersCollection = await client.db(dbName).collection("android_users");
            let iosUsers = iosUsersCollection.find().project(projection).toArray();
            let androidUsers = androidUsersCollection.find().project(projection).toArray();

            response = iosUsers.length + androidUsers.length;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get('/ios/users', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = 0;

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
            const projection = usersFindSchema();
            const iosUsersCollection = await client.db(dbName).collection("ios_users");
            let iosUsers = iosUsersCollection.find().project(projection).toArray();

            response = iosUsers.length;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get('/android/users', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = 0;

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
            const projection = usersFindSchema();
            const androidUsersCollection = await client.db(dbName).collection("android_users");
            let androidUsers = iosUsersCollection.find().project(projection).toArray();

            response = androidUsers.length;
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.get('/annonces', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = 0;

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
            const annoncesCollection = await client.db(dbName).collection("annonces");
            let annonces = annoncesCollection.find().toArray();

            response = annonces.length;
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