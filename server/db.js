const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // para Neon
  }
});

// Inicializar la tabla si no existe
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente TEXT,
        equipo TEXT,
        descripcion_falla TEXT,
        fecha_ingreso DATE,
        fecha_reparado DATE,
        fecha_retiro DATE,
        estado TEXT DEFAULT 'pendiente',
        costo_estimado DECIMAL(10,2),
        nota_tecnica TEXT,
        accesorios TEXT,
        telefono TEXT,
        mail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Base de datos PostgreSQL inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err);
  }
};

// Inicializar al cargar el módulo
initializeDatabase();

module.exports = pool;
