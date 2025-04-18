import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [poste, setPoste] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [overtime, setOvertime] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [overtimeDate, setOvertimeDate] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get('http://localhost:5000/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/employees', { nom, prenom, poste })
      .then(() => {
        fetchEmployees();
        setNom('');
        setPrenom('');
        setPoste('');
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (selectedEmployee && overtimeDate) {
      axios.get(`http://localhost:5000/overtime/${selectedEmployee.id}/${overtimeDate}`)
        .then(res => setOvertimeHours(res.data.nb_heures || ''))
        .catch(err => console.error(err));
    } else {
      setOvertimeHours('');
    }
  }, [selectedEmployee, overtimeDate]);

  const handleAddOvertime = (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      alert('Please select an employee first.');
      return;
    }
    if (!overtimeDate || !overtimeHours) {
      alert('Please enter both date and hours.');
      return;
    }
    axios.post('http://localhost:5000/overtime', {
      employe_id: selectedEmployee.id,
      date: overtimeDate,
      nb_heures: parseFloat(overtimeHours),
    })
      .then(() => {
        setOvertimeDate('');
        setOvertimeHours('');
      })
      .catch(err => console.error(err));
  };

  const calculateOvertime = (employeeId) => {
    axios.get(`http://localhost:5000/overtime/${employeeId}`, {
      params: { startDate, endDate }
    })
      .then(res => setOvertime(res.data))
      .catch(err => console.error(err));
  };

  // Nouvelle fonction pour supprimer un employé
  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      axios.delete(`http://localhost:5000/employees/${employeeId}`)
        .then(() => {
          fetchEmployees(); // Rafraîchir la liste
          if (selectedEmployee && selectedEmployee.id === employeeId) {
            setSelectedEmployee(null); // Désélectionner si supprimé
          }
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="container">
      <h1>Employee Management</h1>

      <div className="card">
        <h2>Add Employee</h2>
        <form onSubmit={handleAddEmployee}>
          <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
          <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} />
          <input type="text" placeholder="Poste" value={poste} onChange={e => setPoste(e.target.value)} />
          <button className="add-employee-btn" type="submit">Add</button>
        </form>
      </div>

      <div className="card">
        <h2>Employee List</h2>
        <ul>
          {employees.map(emp => (
            <li
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className={selectedEmployee?.id === emp.id ? 'selected' : ''}
            >
              {emp.prenom} {emp.nom} - {emp.poste}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Empêche le clic sur la ligne
                  handleDeleteEmployee(emp.id);
                }}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedEmployee && (
        <div className="card">
          <h3>Manage Overtime for {selectedEmployee.prenom} {selectedEmployee.nom}</h3>
          <form onSubmit={handleAddOvertime}>
            <input
              type="date"
              value={overtimeDate}
              onChange={e => setOvertimeDate(e.target.value)}
            />
            <input
              type="number"
              placeholder="Hours"
              value={overtimeHours}
              onChange={e => setOvertimeHours(e.target.value)}
              step="0.1"
            />
            <button className="add-overtime-btn" type="submit">Save Overtime</button>
          </form>

          <h3>Calculate Overtime</h3>
          <div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <button className="calculate-btn" onClick={() => calculateOvertime(selectedEmployee.id)}>
              Calculate
            </button>
          </div>
          {overtime && <p className="result">Total Overtime Cost: ${overtime.total_overtime_cost.toFixed(2)}</p>}
        </div>
      )}
    </div>
  );
}

export default App;