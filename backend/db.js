const mysql = require('mysql2/promise');
require('dotenv').config();

// Initial connection to MySQL (without specifying a database)
const initPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

// Main connection pool for the app
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    const connection = await initPool.getConnection();
    
    // Create database if it doesn’t exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} ensured.`);

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create Employe table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Employe (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        poste VARCHAR(255) NOT NULL
      )
    `);

    // Create Tarif table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Tarif (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_jour VARCHAR(50) NOT NULL,
        tarif FLOAT NOT NULL
      )
    `);

    // Create HeuresSup table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS HeuresSup (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employe_id INT,
        date DATE NOT NULL,
        nb_heures FLOAT NOT NULL,
        FOREIGN KEY (employe_id) REFERENCES Employe(id)
      )
    `);

    // Insert default tariffs if not present (needed for overtime calculation)
    const [tarifRows] = await connection.query(`SELECT COUNT(*) as count FROM Tarif`);
    if (tarifRows[0].count === 0) {
      await connection.query(`
        INSERT INTO Tarif (type_jour, tarif) VALUES 
        ('jour ordinaire', 15.0),
        ('weekend', 20.0)
      `);
      console.log('Default tariffs inserted.');
    }

    console.log('Database and tables initialized successfully.');
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

module.exports = { pool, initializeDatabase };