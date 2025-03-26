const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database and start server
const startServer = async () => {
  await initializeDatabase(); // Ensure DB is ready

  // Get all employees
  app.get('/employees', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM Employe');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add a new employee
  app.post('/employees', async (req, res) => {
    const { nom, prenom, poste } = req.body;
    if (!nom || !prenom || !poste) {
      return res.status(400).json({ error: 'All fields (nom, prenom, poste) are required' });
    }
    try {
      const [result] = await pool.query(
        'INSERT INTO Employe (nom, prenom, poste) VALUES (?, ?, ?)',
        [nom, prenom, poste]
      );
      res.status(201).json({ id: result.insertId, nom, prenom, poste });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add or update overtime hours
  app.post('/overtime', async (req, res) => {
    const { employe_id, date, nb_heures } = req.body;
    if (!employe_id || !date || !nb_heures) {
      return res.status(400).json({ error: 'All fields (employe_id, date, nb_heures) are required' });
    }
    try {
      // Check if an entry exists for this employee and date
      const [existing] = await pool.query(
        'SELECT id FROM HeuresSup WHERE employe_id = ? AND date = ?',
        [employe_id, date]
      );
      if (existing.length > 0) {
        // Update existing entry
        await pool.query(
          'UPDATE HeuresSup SET nb_heures = ? WHERE id = ?',
          [nb_heures, existing[0].id]
        );
        res.status(200).json({ id: existing[0].id, employe_id, date, nb_heures });
      } else {
        // Insert new entry
        const [result] = await pool.query(
          'INSERT INTO HeuresSup (employe_id, date, nb_heures) VALUES (?, ?, ?)',
          [employe_id, date, nb_heures]
        );
        res.status(201).json({ id: result.insertId, employe_id, date, nb_heures });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get overtime hours for an employee on a specific date
  app.get('/overtime/:employeeId/:date', async (req, res) => {
    const { employeeId, date } = req.params;
    try {
      const [rows] = await pool.query(
        'SELECT nb_heures FROM HeuresSup WHERE employe_id = ? AND date = ?',
        [employeeId, date]
      );
      res.json(rows[0] || { nb_heures: '' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get overtime cost for an employee over a period
  app.get('/overtime/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    try {
      const [rows] = await pool.query(`
        SELECT e.nom, e.prenom, SUM(h.nb_heures * t.tarif) as total_overtime_cost
        FROM HeuresSup h
        JOIN Employe e ON h.employe_id = e.id
        JOIN Tarif t ON t.type_jour = 
          CASE WHEN DAYOFWEEK(h.date) IN (1, 7) THEN 'weekend' ELSE 'jour ordinaire' END
        WHERE h.employe_id = ? AND h.date BETWEEN ? AND ?
        GROUP BY e.id, e.nom, e.prenom
      `, [employeeId, startDate, endDate]);
      res.json(rows[0] || { total_overtime_cost: 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Start the server
startServer();