# 🎮 DeathCloud — Plataforma de Juegos Full Stack

Plataforma gaming completa con autenticación, chat en tiempo real, tienda de skins, sistema de E-Points, ranking de jugadores, soporte técnico y panel de administración. Diseñada como proyecto universitario de Sistemas Operativos / Redes.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Node.js + Express |
| **Base de Datos** | PostgreSQL (con fallback in-memory para desarrollo offline) |
| **Auth** | JWT + bcryptjs |
| **Tiempo Real** | WebSockets (socket.io) |
| **Proxy (Prod)** | Nginx |
| **Gestor de Procesos (Prod)** | PM2 |

---

## 📁 Estructura del Proyecto

```
login-app/
├── backend/
│   ├── config/
│   │   └── db.js              # Pool PostgreSQL + Mock in-memory fallback
│   ├── controllers/
│   │   ├── authController.js  # Login / Registro
│   │   ├── userController.js  # Perfil, avatar, bio
│   │   ├── gameController.js  # E-Points, skins, stats
│   │   ├── friendsController.js
│   │   ├── ticketsController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── gameRoutes.js
│   │   ├── friendsRoutes.js
│   │   ├── ticketsRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── adminMiddleware.js
│   ├── server.js
│   ├── create_db.js           # Script de inicialización de DB
│   └── .env / .env.dev        # Variables de entorno (no incluidas en git)
├── frontend/
│   └── react-app/
│       └── src/
│           ├── views/
│           │   ├── Dashboard.jsx
│           │   ├── Profile.jsx       # Perfil + Inventario de skins
│           │   ├── Ranking.jsx
│           │   ├── Tienda.jsx
│           │   ├── Comunidad.jsx
│           │   ├── SupportTickets.jsx
│           │   └── AdminDashboard.jsx
│           ├── components/
│           │   ├── layout/
│           │   │   ├── Header.jsx    # Navbar + E-Points modal + Buscador
│           │   │   ├── MainLayout.jsx
│           │   └── chat/
│           │       └── LiveChatPanel.jsx
│           ├── context/
│           │   └── GameContext.jsx   # Selector de juego activo
│           ├── config/
│           │   └── gamesData.js      # Catálogo de juegos y skins
│           └── App.jsx
└── docs/
    ├── DOCUMENTACION_TECNICA.md
    ├── DOCUMENTACION_SPRINT_0.md
    ├── endpoints.md
    ├── GUIA_DE_TESTEO.md
    └── ENVIRONMENT.md
```

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación
- Registro e inicio de sesión con email/contraseña
- JWT con expiración de 24h
- Sesión persistente en `localStorage`
- Limpieza automática de sesión anterior al loguearse

### 👤 Perfil de Usuario
- Edición de nickname, bio y avatar URL
- Tab **INVENTARIO** — visualización de skins adquiridas por juego
- Historial de actividad

### 🪙 E-Points (Moneda Virtual)
- Balance persistente por usuario y por juego
- Compra de paquetes de E-Points
- Descuento automático al comprar skins

### 🛍️ Tienda de Skins
- Catálogo de skins por juego (DeathCloud Runner, Toxic Skies, 2D)
- Compra con E-Points
- Indicador de skin ya adquirida

### 🏆 Ranking
- Leaderboard por juego con top scores
- Visualización de nombre de jugador y puntaje

### 💬 Chat en Vivo
- Canal global en tiempo real
- Menú contextual de usuario (ver perfil, agregar amigo, silenciar)
- Moderación de mensajes

### 🎫 Soporte Técnico
- Creación de tickets
- Estado de tickets (Abierto / En revisión / Cerrado)

### 🛡️ Panel de Administración
- Gestión de usuarios (banear, cambiar rol)
- Acceso restringido a `rol: admin`

### 🌐 Comunidad
- Publicaciones y comentarios
- Perfil público de jugadores

---

## 💾 Base de Datos

El sistema usa una estrategia **híbrida resiliente**:

1. **Modo Normal**: Se conecta a PostgreSQL usando el pool configurado en `.env`
2. **Modo Mock (Offline)**: Si no hay conexión a PostgreSQL, activa automáticamente una base de datos en memoria con datos de prueba. Ideal para desarrollo sin DB local.

### Esquema de Bases de Datos

- `death_cloud_dev` — Base compartida (usuarios, mensajes, tickets, amigos)
- `death_cloud_dev_runner` — Stats y skins de DeathCloud Runner
- `death_cloud_dev_skies` — Stats y skins de Toxic Skies
- `death_cloud_dev_2d` — Stats y skins de DeathCloud 2D

Inicializar con:
```bash
node backend/create_db.js
```

---

## 🛢️ Variables de Entorno

Crea un archivo `backend/.env` basado en:

```env
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_password
DB_PORT=5432
DB_NAME=death_cloud_dev
JWT_SECRET=tu_clave_secreta
PORT=3000
NODE_ENV=development
```

---

## 💻 Correr en Desarrollo (Local)

### Backend
```bash
cd backend
npm install
npm run dev    # nodemon server.js en puerto 3000
```

### Frontend
```bash
cd frontend/react-app
npm install
npm run dev    # Vite en puerto 5173
```

> Si no hay PostgreSQL disponible, el backend activa automáticamente el **Modo Mock** y la app funciona igual con datos de prueba.

**Credenciales de prueba (Modo Mock):**
| Usuario | Email | Contraseña |
|---|---|---|
| Sebastian | seba@test.com | seba123 |
| diego | diego@deathcloud.com | admin123 |

---

## 🚀 Despliegue en Producción (Ubuntu Server + Nginx)

1. Clonar el repositorio en `/var/www/deathcloud`
2. Instalar dependencias:
   ```bash
   cd backend && npm install
   cd ../frontend/react-app && npm install && npm run build
   ```
3. Configurar Nginx para servir `frontend/react-app/dist/` y hacer proxy a `localhost:3000`
4. Iniciar el backend con PM2:
   ```bash
   pm2 start backend/server.js --name deathcloud-backend
   pm2 save
   ```

---

## 📄 Documentación Adicional

- [`docs/endpoints.md`](docs/endpoints.md) — Referencia de todos los endpoints de la API
- [`docs/DOCUMENTACION_TECNICA.md`](docs/DOCUMENTACION_TECNICA.md) — Arquitectura y decisiones de diseño
- [`docs/GUIA_DE_TESTEO.md`](docs/GUIA_DE_TESTEO.md) — Guía de pruebas funcionales
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — Configuración de entornos DEV/PROD

---

## ✍🏻 Autores

- Proyecto Final — Sistemas Operativos / Redes
- Universidad, 2026
