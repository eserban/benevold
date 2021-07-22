var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userAdminSchema, jwtAdminSignSchema, usersFindSchema, categorieSchema } = require("../../modelsDB.js");
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

    /**
     * COUNT ROUTES
     */
    router.use("/count", countRoutes);



    //ROUTE GET PROFILES
    router.get('/profiles', async (req, res) => {
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
            const userCollection = await client.db(dbName).collection("users");
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

    //ROUTE GET CATEGORIES/CATEGORY
    router.get('/categories', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        const categoryId = req.query.id ?? null;


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
            const categoriesCollection = await client.db(dbName).collection("categories");
            if(categoryId) {
                let categoryOid = new mongo.ObjectID(categoryId);
                response = await categoriesCollection.find({"_id": categoryOid}).toArray();
            }
            response = await categoriesCollection.find().toArray();
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    //ROUTE POST CATEGORY
    router.post('/category', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        let title = req.body.title ?? null;


        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed"
        } else if (!title) {
            success = false;
            code = 400;
            errorMessage = "Veuillez reinseigner toutes les informations pour une catégorie"
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            const categoriesCollection = await client.db(dbName).collection("categories");
            let category = categorieSchema(title);
            try{
                await categoriesCollection.insertOne(category);
            }catch(err) {
                success = false;
                code = 500;
                errorMessage = err.message;
            }
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    //ROUTE GET ANNONCE/ANNONES
    router.get('/annonces', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let tokenObject = null;
        const annId = req.query.id ?? null;


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
            const annoncesCollection = await client.db(dbName).collection("annonces");
            if(annId) {
                let annOid = new mongo.ObjectID(annId);
                response = await annoncesCollection.find({"_id": annOid}).toArray();
            }
            response = await annoncesCollection.find().toArray();
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage,
            "response": response
        };

        res.status(code).send(data);
    });

    router.delete('/annonce', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let annId = req.body.annonce_id ?? null;
        let annOid = new mongo.ObjectID(annId);

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const annoncesCollection = await client.db(dbName).collection("annonces");
        let annonce = await annonceCollection.find({"_id": annOid}).toArray();

        if (!token) {
            success = false;
            code = 400;
            errorMessage = "Authentification Failed";
        }else if (!annId) {
            success = false;
            code = 401;
            errorMessage = "Veuillez entrer l'id de l'annonce a effacer";
        } else if (annonce.length == 0) {
            success = false;
            code = 402;
            errorMessage = "Cette annonce n'a pas été trouvée";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await annoncesCollection.deleteOne({"_id": annOid});
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.delete('/category', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let categoryId = req.body.category_id ?? null;
        let categoryOid = new mongo.ObjectID(categoryId);

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const categoriesCollection = await client.db(dbName).collection("categories");
        let category = await categoriesCollection.find({"_id": categoryOid}).toArray();

        if (!token) {
            success = false;
            code = 400;
            errorMessage = "Authentification Failed";
        }else if (!categoryId) {
            success = false;
            code = 401;
            errorMessage = "Veuillez entrer l'id de l'annonce a effacer";
        } else if (category.length == 0) {
            success = false;
            code = 402;
            errorMessage = "Cette categorie n'a pas été trouvée";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await categoriesCollection.deleteOne({"_id": categoryOid});
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    router.delete('/profile', async (req, res) => {
        const token = req.header('access-token') ?? null;

        let profileId = req.body.profile_id ?? null;
        let profileOid = new mongo.ObjectID(profileId);

        let success = true;
        let code = 200;
        let errorMessage = null;
        let response = [];

        const profilesCollection = await client.db(dbName).collection("flutter_profiles");
        let profile = await profilesCollection.find({"_id": profileOid}).toArray();

        if (!token) {
            success = false;
            code = 403;
            errorMessage = "Authentification Failed";
        }else if (!profileId) {
            success = false;
            code = 403;
            errorMessage = "Veuillez entrer l'id de l'annonce a effacer";
        } else if (profile.length == 0) {
            success = false;
            code = 403;
            errorMessage = "Cette annonce n'a pas été trouvée";
        } else {
            tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
            if (!tokenObject) {
                success = false;
                code = 500;
                errorMessage = "Your connection token is no more valid";
            }
        }

        if (success) {
            await profilesCollection.deleteOne({"_id": profileOid});
        }

        const data = {
            "success": success,
            "requestCode": code,
            "error": errorMessage
        };

        res.status(code).send(data);
    });

    // définir le point d'entrée `POST /` pour l'enregistrement d'un nouvel utilisateur
    router.post("/add/admin", async (req, res) => {
        const password = req.body.password ?? null;
        const email = req.body.email ?? null;

        const emailRegex = /^\S+@\S+$/;

        let success         = true;
        let code            = 200;
        let errorMessage    = null;

        const userCollection    = await client.db(dbName).collection("flutter_admin_users");
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

    router.post("/signin/admin", async (req, res) => {
        try{
            const email = req.body.email ?? null;
            const password = req.body.password ?? null;

            let success         = true;
            let code            = 200;
            let errorMessage    = null;
            let token           = null;

            const userCollection    = await client.db(dbName).collection("flutter_admin_users");
            const user              = await userCollection.find({"email": email}).limit(1).toArray();

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
                let tokenSignSchema = jwtAdminSignSchema(user[0]._id, user[0].email);
                
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

    router.get("/users", async (req, res) => {
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
          tokenObject = jwt.verify(token, process.env.JWT_KEY) ?? null;
          if(!tokenObject){
            success         = false;
            code            = 500;
            errorMessage    = "An error has occurred";
          }
        }
    
        if(success){
            userEmail = tokenObject.email;
            const userCollection    = await client.db(dbName).collection("flutter_admin_users");
            const projection = usersFindSchema();
            if(userId) {
                let userOid = new mongo.ObjectID(userId);
                response = await userCollection.find({"_id": userOid}).project(projection).toArray();
            }
            response = await userCollection.find().project(projection).toArray();
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


})();

module.exports = router;
