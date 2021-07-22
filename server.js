const express = require("express");
const jelloRoutes = require('./routes/jello/routes-jello.js');
const flutterRoutes = require('./routes/flutter/routes-flutter.js');
const swiftRoutes = require('./routes/swift/routes-ios.js');
const authRoutes = require('./routes/auth/routes-auth.js');
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(cors());
app.use('/jello', jelloRoutes);
app.use('/flutter', flutterRoutes);
app.use('/ios', swiftRoutes);
app.use('/auth', authRoutes);


// demander au serveur applicatif d'attendre des requêtes depuis le port spécifié plus haut
app.listen(PORT, () => {
  console.log(`Example app listening at http://https://benevold.herokuapp.com/:${PORT}`);
});
