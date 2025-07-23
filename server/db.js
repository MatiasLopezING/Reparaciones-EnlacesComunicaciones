const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/pedidos.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT,
    equipo TEXT,
    descripcion_falla TEXT,
    fecha_ingreso TEXT,
    estado TEXT DEFAULT 'pendiente',
    costo_estimado REAL,
    nota_tecnica TEXT,
    accesorios TEXT,
    telefono TEXT,
    mail TEXT
  )`);
});

module.exports = db;
