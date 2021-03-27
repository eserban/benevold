const express = require('express');
const router = express.Router();
const { userSchema } = require("../modelsDB.js");

router.get('/login', (req, res) => {

});

// définir le point d'entrée `POST /` pour l'enregistrement d'un nouvel utilisateur
router.post("/register", async (req, res) => {
    const user = await registerCollection.find({"user": req.body.user}).toArray();
    if(user.length === 0){
      await registerCollection.insertMany([
        userSchema(req.body.user, req.body.password, req.body.role)
      ]);
      res.send({"success": "User added"});
    }else{
      res.send({"error": "registration not possible"});
    }
});

module.exports = router;