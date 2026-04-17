const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Protection par clé API
const validateKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key === 'natolo_secret_2026') return next();
  res.status(401).json({ error: 'Accès refusé' });
};

// Route d'envoi (SÉCURISÉE)
app.post('/v1/submissions', validateKey, async (req, res) => {
  const { id, form_id, data, metadata } = req.body;
  try {
    await pool.query(
      "INSERT INTO submissions (id, form_id, data, metadata) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
      [id, form_id, data, metadata]
    );
    res.status(201).json({ message: "OK" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Route Statistiques
app.get('/stats', async (req, res) => {
  const stats = await pool.query("SELECT count(*) FROM submissions");
  res.json({ total: stats.rows[0].count });
});

// Route Derniers Membres
app.get('/recent', async (req, res) => {
  const result = await pool.query("SELECT data, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5");
  res.json(result.rows);
});

// Route Export CSV
app.get('/export-csv', async (req, res) => {
  try {
    const result = await pool.query("SELECT data, submitted_at FROM submissions ORDER BY submitted_at DESC");
    let csv = "Date;Nom;Status\n";
    result.rows.forEach(row => {
      const date = new Date(row.submitted_at).toISOString();
      csv += `${date};${row.data.nom};${row.data.status}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=membres_natolo.csv');
    res.status(200).send(csv);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(3000, () => console.log("API NatoloCollect Ready on port 3000"));
