CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE Employe (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  poste VARCHAR(255) NOT NULL
);

CREATE TABLE Tarif (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_jour VARCHAR(50) NOT NULL,
  tarif FLOAT NOT NULL
);

CREATE TABLE HeuresSup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT,
  date DATE NOT NULL,
  nb_heures FLOAT NOT NULL,
  FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

-- Sample data
INSERT INTO Employe (nom, prenom, poste) VALUES 
('Dupont', 'Jean', 'Développeur'),
('Martin', 'Sophie', 'Manager');

INSERT INTO Tarif (type_jour, tarif) VALUES 
('jour ordinaire', 15.0),
('weekend', 20.0);

INSERT INTO HeuresSup (employe_id, date, nb_heures) VALUES 
(1, '2025-03-24', 2.5),
(1, '2025-03-29', 3.0),
(2, '2025-03-25', 1.5);