# 🔧 Enlaces Comunicaciones - Sistema de Gestión de Reparaciones

![Logo Enlaces](public/img/logo_enlaces-192.png)

**Sistema Web Profesional para gestionar órdenes de reparación con autenticación JWT, base de datos PostgreSQL y seguridad avanzada.**

[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-≥14.0.0-green.svg)](https://nodejs.org)

---

## 🌟 Características Principales

- **🔐 Autenticación JWT** - Login seguro con token persistente
- **📱 Responsive Design** - Compatible con móviles y tablets  
- **🚀 Sistema de Estados** - Flujo simple: Pendiente → Reparado → Retirado
- **💰 Gestión de Costos** - Modal para registrar costo final y notas técnicas
- **🔍 Búsqueda en Tiempo Real** - Filtra por cliente, equipo, teléfono, etc.
- **📊 Exportación Excel** - Descarga reportes completos con un clic
- **🛡️ Seguridad Avanzada** - Rate limiting, CSP, headers seguros
- **☁️ Base de Datos Cloud** - PostgreSQL en Neon (sin SQLite local)

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
- **PostgreSQL** en Neon Cloud
- **Migrations** automáticas al iniciar
- **Conexión SSL** para producción

---

## 🚀 Deploy en Render

### Variables de Entorno Requeridas

Configura estas variables en Render:

```bash
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Autenticación
JWT_SECRET=tu_jwt_secret_super_seguro
ADMIN_USER=admin
ADMIN_PASSWORD=tu_password_segura

# Servidor
PORT=3000
NODE_ENV=production
```

### Configuración en Render

1. **Conecta tu repositorio GitHub**
2. **Configura el servicio:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18.x
3. **Agrega las variables de entorno**
4. **Deploy automático** ✅

---

## 📱 Capturas de Pantalla

### Formulario de Órdenes
![Formulario](screenshots/formulario.PNG)

### Tabla de Gestión
![Tabla](screenshots/tabla.PNG)

### Exportación Excel
![Excel](screenshots/export_excel.PNG)

---

## ⚡ Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/MatiasLopezING/Reparaciones-EnlacesComunicaciones.git
cd Reparaciones-EnlacesComunicaciones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env`:

```bash
# Base de datos PostgreSQL (Neon)
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
- Contraseña: `enlaces2025`

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

## 🌍 Demo en Vivo

🔗 **[Ver Demo](https://tu-app.onrender.com)**

**Credenciales de prueba:**
- Usuario: `admin` 
- Contraseña: `enlaces2025`

---

## 📝 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## ✍️ Autor

**Matías López**  
🎓 Ingeniería en Computación, UNLP  
🏢 Enlaces Comunicaciones  
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

[![GitHub stars](https://img.shields.io/github/stars/MatiasLopezING/Reparaciones-EnlacesComunicaciones.svg?style=social&label=Star)](https://github.com/MatiasLopezING/Reparaciones-EnlacesComunicaciones)
