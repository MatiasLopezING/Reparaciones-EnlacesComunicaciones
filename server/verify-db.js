// Script para verificar y configurar la base de datos PostgreSQL
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

console.log('🔍 Verificando conexión a PostgreSQL...');

if (!process.env.DATABASE_URL) {
  console.error('❌ No se encontró DATABASE_URL en el archivo .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const verificarBaseDatos = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar si la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pedidos'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabla "pedidos" existe');
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) FROM pedidos');
      console.log(`📊 Registros en la tabla: ${count.rows[0].count}`);
      
    } else {
      console.log('⚠️  Creando tabla "pedidos"...');
      
      await client.query(`
        CREATE TABLE pedidos (
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
      
      console.log('✅ Tabla "pedidos" creada exitosamente');
    }
    
    client.release();
    console.log('🎉 Verificación completada exitosamente!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('🔧 Verifica tu configuración de base de datos');
  } finally {
    await pool.end();
  }
};

verificarBaseDatos();
