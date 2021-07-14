const express = require("express");
const adminAuth = require('./routes/auth/routes-admin.js');
const jelloRoutes = require('./routes/jello/routes-jello.js');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use('/api/admin', adminAuth);
app.use('/jello', jelloRoutes);


// demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
app.listen(PORT, () => {
  console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
});
