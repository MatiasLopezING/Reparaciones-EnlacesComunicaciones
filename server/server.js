/**
 * Sistema de Gestión de Reparaciones - Enlaces Comunicaciones
 * Servidor Express con autenticación JWT y PostgreSQL
 * 
 * @author Enlaces Comunicaciones
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURACIÓN DE MIDDLEWARE DE SEGURIDAD
// ==========================================

// Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"], // Permite onclick, onsubmit, etc.
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS
app.use(cors());

// Parsing de JSON con límite de tamaño
app.use(express.json({ limit: '1mb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: { error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ==========================================

/**
 * Middleware para verificar autenticación JWT
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

/**
 * POST /api/login - Autenticación de usuario
 */
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { usuario, password } = req.body;
    
    console.log('🔍 LOGIN ATTEMPT:', { usuario, password: password ? '***' : 'vacío' });
    
    // Validar entrada
    if (!usuario || !password) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }
    
    const validUser = process.env.ADMIN_USER || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'enlaces2025';
    
    console.log('🔑 Credenciales esperadas:', { validUser, validPassword: validPassword ? '***' : 'vacío' });
    console.log('✅ Comparación:', { 
      userMatch: usuario === validUser, 
      passMatch: password === validPassword 
    });
    
    // Verificar credenciales
    if (usuario === validUser && password === validPassword) {
      console.log('✅ LOGIN EXITOSO');
      // Generar JWT token
      const token = jwt.sign(
        { 
          username: usuario, 
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          username: usuario,
          role: 'admin'
        }
      });
    } else {
      console.log('❌ CREDENCIALES INCORRECTAS');
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * POST /api/logout - Cerrar sesión
 */
app.post('/api/logout', requireAuth, (req, res) => {
  res.json({ message: 'Sesión cerrada exitosamente' });
});

// ==========================================
// RUTAS DE LA API (PROTEGIDAS)
// ==========================================

/**
 * GET /api/pedidos - Obtener todas las órdenes
 */
app.get('/api/pedidos', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pedidos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

/**
 * POST /api/pedidos - Crear nueva orden
 */
app.post('/api/pedidos', requireAuth, async (req, res) => {
  try {
    const { cliente, equipo, descripcion_falla, telefono, mail, accesorios } = req.body;
    
    // Validar datos requeridos
    if (!cliente || !equipo) {
      return res.status(400).json({ error: 'Cliente y equipo son requeridos' });
    }
    
    const result = await db.query(
      `INSERT INTO pedidos (cliente, equipo, descripcion_falla, telefono, mail, accesorios, fecha_ingreso)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) 
       RETURNING id`,
      [cliente, equipo, descripcion_falla, telefono, mail, accesorios]
    );
    
    res.json({ 
      message: 'Pedido creado exitosamente', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

/**
 * PUT /api/pedidos/:id - Actualizar orden
 */
app.put('/api/pedidos/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convertir costo_estimado a número si está presente
    if (updates.costo_estimado !== undefined) {
      updates.costo_estimado = updates.costo_estimado && updates.costo_estimado !== '' ? 
        parseFloat(updates.costo_estimado) : null;
    }
    
    // Construir query dinámicamente
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = Object.values(updates);
    values.push(id);
    
    const query = `UPDATE pedidos SET ${setClause} WHERE id = $${values.length}`;
    
    await db.query(query, values);
    res.json({ message: 'Pedido actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

/**
 * DELETE /api/pedidos/:id - Eliminar orden
 */
app.delete('/api/pedidos/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM pedidos WHERE id = $1', [id]);
    res.json({ message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

/**
 * GET /api/buscar - Buscar órdenes
 */
app.get('/api/buscar', requireAuth, async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    const result = await db.query(
      `SELECT * FROM pedidos 
       WHERE cliente ILIKE $1 
          OR equipo ILIKE $1 
          OR telefono ILIKE $1 
          OR mail ILIKE $1 
          OR estado ILIKE $1 
          OR nota_tecnica ILIKE $1
       ORDER BY id DESC`,
      [`%${term}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// ==========================================
// MIDDLEWARE PARA REDIRECCIÓN DE LOGIN
// ==========================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


// ==========================================
// MANEJO DE ERRORES GLOBAL
// ==========================================

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await db.query('SELECT 1');
    console.log('✅ Base de datos PostgreSQL inicializada correctamente');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Documentación: http://localhost:${PORT}/login.html`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
};

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
