# 🔧 Sistema de Gestión de Reparaciones

![Logo](public/img/logo_enlaces-192.png)

**Sistema Web Profesional para gestionar órdenes de reparación con autenticación JWT, base de datos PostgreSQL y seguridad avanzada.**

[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-≥14.0.0-green.svg)](https://nodejs.org)

---

## 🌟 Características Principales

- **🔐 Autenticación Segura** - Login JWT con credenciales protegidas
- **📱 Diseño Responsive** - Compatible con móviles y tablets  
- **🚀 Gestión de Estados** - Flujo: Pendiente → Reparado → Retirado
- **💰 Control de Costos** - Modal para registrar precio final y notas
- **🔍 Búsqueda Inteligente** - Filtra por cliente, equipo, teléfono, etc.
- **📊 Reportes Excel** - Exportación completa con un clic
- **🛡️ Seguridad Avanzada** - Rate limiting, CSP, headers seguros
- **☁️ Base de Datos Cloud** - PostgreSQL con SSL en producción

---

## 💻 Tecnologías

### Frontend
- **HTML5 + CSS3** con Bootstrap 5.3.3
- **JavaScript ES6+** vanilla (sin frameworks)
- **Bootstrap Icons** 1.10.5
- **PWA Ready** con manifest.json

### Backend  
- **Node.js** con Express 4.18.2
- **JWT** para autenticación
- **Helmet** para headers de seguridad
- **Rate Limiting** anti-brute force
- **CORS** configurado

### Base de Datos
- **PostgreSQL** en producción
- **Migrations** automáticas al iniciar
- **Conexión SSL** para producción

---

## 🚀 Deploy 

### Variables de Entorno Requeridas

Configura estas variables en tu servicio de hosting:

```bash
# Base de datos PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Autenticación
JWT_SECRET=tu_jwt_secret_super_seguro
ADMIN_USER=admin
ADMIN_PASSWORD=tu_password_segura

# Servidor
PORT=3000
NODE_ENV=production
```

### Configuración General

1. **Conecta tu repositorio**
2. **Configura el servicio:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18.x
3. **Agrega las variables de entorno**
4. **Deploy automático** ✅

---

## 📱 Capturas de Pantalla

### 🔐 Sistema de Login
![Login](screenshots/login.PNG)
*Sistema de autenticación JWT con credenciales seguras*

### 📝 Formulario de Órdenes
![Formulario](screenshots/formulario.PNG)
*Interfaz intuitiva para crear nuevas órdenes de reparación*

### 📋 Tabla de Gestión Técnica
![Tabla Técnico](screenshots/tecnico_tabla.PNG)
*Vista completa de todas las órdenes con estados y acciones*

### 📊 Exportación de Reportes
![Excel Captura](screenshots/exel_captura.PNG)
*Descarga de reportes completos en formato Excel*

---

## ⚡ Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/TuUsuario/sistema-reparaciones.git
cd sistema-reparaciones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env`:

```bash
# Base de datos PostgreSQL
DATABASE_URL=tu_connection_string_postgresql

# JWT y autenticación  
JWT_SECRET=tu_jwt_secret
ADMIN_USER=admin
ADMIN_PASSWORD=tu_password

# Puerto (opcional)
PORT=3000
```

### 4. Iniciar servidor

```bash
npm run dev
# o en producción
npm start
```

### 5. Acceder a la aplicación

```
http://localhost:3000/login.html
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `password123`

---

## 🎯 Flujo de Trabajo

### 1. **Crear Orden** 🟡
- Cliente, equipo, descripción de falla
- Teléfono y/o email
- Estado: **Pendiente** (amarillo)

### 2. **Completar Reparación** 🟢  
- Botón "Reparado" abre modal
- Registrar costo final y nota técnica
- Estado: **Reparado** (verde)

### 3. **Marcar como Retirado** 🔵
- Cliente retira el equipo
- Estado: **Retirado** (celeste)

---

## 📊 Estructura del Proyecto

```
mi-web-reparaciones/
├── public/              # Frontend estático
│   ├── index.html       # Página principal
│   ├── login.html       # Página de login
│   ├── script.js        # Lógica frontend
│   ├── style.css        # Estilos personalizados
│   ├── icons/           # Favicons PWA
│   └── img/             # Imágenes y logos
├── server/              # Backend Express
│   ├── server.js        # Servidor principal
│   ├── db.js            # Conexión PostgreSQL
│   └── verify-db.js     # Verificador de BD
├── screenshots/         # Capturas para README
├── package.json         # Dependencias y scripts
├── .env.example         # Ejemplo de variables
├── .gitignore          # Archivos ignorados
└── README.md           # Documentación
```

---

## � Scripts Disponibles

```bash
npm start       # Producción
npm run dev     # Desarrollo  
npm run verify-db   # Verificar base de datos
```

---

## 🛡️ Seguridad Implementada

- ✅ **JWT Authentication** con expiración 24h
- ✅ **Rate Limiting** 5 intentos de login por IP
- ✅ **Content Security Policy** configurado
- ✅ **Headers de seguridad** con Helmet
- ✅ **Validación de inputs** en frontend y backend
- ✅ **Conexión SSL** a base de datos
- ✅ **Variables de entorno** para secrets

---

## 🌍 Demo

🔗 **[Ver Demo en Vivo]([https://reparaciones-enlacescomunicaciones.onrender.com])**

**Credenciales de prueba:**
- Usuario: `admin` 
- Contraseña: `password123`

---

## 📝 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## ✍️ Autor

**Matías López**  
🎓 Ingeniero en Computación, UNLP  
💻 Full Stack Developer  
📧 [Contacto](mailto:tu@email.com)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## ⭐ Dale una estrella

¿Te gustó el proyecto? ¡Dale una estrella en GitHub!

[![GitHub stars](https://img.shields.io/github/stars/TuUsuario/sistema-reparaciones.svg?style=social&label=Star)](https://github.com/TuUsuario/sistema-reparaciones)
