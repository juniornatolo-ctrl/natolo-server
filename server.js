const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors(), express.json());

// Version avec IP directes pour éviter l'erreur ENOTFOUND
const mongoURI = "mongodb://juniornatolo_db_user:2mdpn3Lwow5rhOss@ac-jswsh8q-shard-00-00.c6gsh8q.mongodb.net:27017,ac-jswsh8q-shard-00-01.c6gsh8q.mongodb.net:27017,ac-jswsh8q-shard-00-02.c6gsh8q.mongodb.net:27017/natolo_db?ssl=true&replicaSet=atlas-mbot5m-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("🌍 SYSTÈME NATOLO : CONNECTÉ AU CLOUD GLOBAL"))
  .catch(err => {
    console.log("❌ Erreur de connexion Cloud.");
    console.log("👉 Vérifie que tu as bien ajouté '0.0.0.0/0' dans Network Access sur Atlas.");
  });

const Domaine = mongoose.model('Domaine', { nom: String, structure: Array });
const Collecte = mongoose.model('Collecte', { domaine: String, donnees: Object, date: { type: Date, default: Date.now } });

app.post('/admin/creer-domaine/:nom', async (req, res) => {
    await Domaine.findOneAndUpdate({ nom: req.params.nom.toLowerCase() }, { structure: req.body }, { upsert: true });
    res.send({ message: "Domaine international activé !" });
});

app.get('/app/charger-domaine/:nom', async (req, res) => {
    const d = await Domaine.findOne({ nom: req.params.nom.toLowerCase() });
    res.json(d ? d.structure : []);
});

app.post('/app/envoyer-donnees/:nom', async (req, res) => {
    const c = new Collecte({ domaine: req.params.nom.toLowerCase(), donnees: req.body });
    await c.save();
    res.send({ message: "Donnée enregistrée dans le Cloud !" });
});

app.listen(3000, '0.0.0.0', () => console.log("🚀 SERVEUR NATOLO EN LIGNE SUR LE PORT 3000"));
