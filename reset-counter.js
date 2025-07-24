const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B1MgOIqdneP9@ep-weathered-brook-acpqgmqh-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function resetCounter() {
  try {
    // Borrar todos los pedidos (opcional)
    await pool.query('DELETE FROM pedidos');
    console.log('✅ Todos los pedidos eliminados');
    
    // Reiniciar contador
    await pool.query('ALTER SEQUENCE pedidos_id_seq RESTART WITH 1');
    console.log('✅ Contador reiniciado a 1');
    
    console.log('🎉 Listo! El próximo pedido será ID #1');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

resetCounter();
