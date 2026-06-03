# 🌍 Configuración de Entornos — DeathCloud

## Variables de Entorno (`backend/.env`)

Copia `.env.example` a `.env` y ajusta los valores:

```env
# Servidor
PORT=3000
NODE_ENV=development
JWT_SECRET=deathcloud-secret-key-dev-2026

# Base de datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost          # O IP del servidor via VPN (ej: 192.168.50.24)
DB_PASSWORD=tu_password
DB_PORT=5432
DB_NAME=death_cloud_dev

# CORS - URL del frontend
FRONTEND_URL=http://localhost:5173
```

---

## Entornos Disponibles

| Variable | DEV (local) | DEV (VPN) | PROD |
|---|---|---|---|
| `DB_HOST` | `localhost` | `192.168.50.24` | IP del servidor |
| `DB_NAME` | `death_cloud_dev` | `death_cloud_dev` | `death_cloud_prod` |
| `PORT` | `3000` | `3000` | `4000` |
| `NODE_ENV` | `development` | `development` | `production` |
| `FRONTEND_URL` | `http://localhost:5173` | `http://localhost:5173` | `https://deathcloud.com` |

---

## Modo Mock (Sin DB)

Si PostgreSQL **no está disponible**, el backend activa automáticamente un modo in-memory:

- ✅ Login funciona con usuarios pre-cargados (Sebastian / diego)
- ✅ E-Points, skins, stats funcionan en memoria
- ❌ Los datos **no persisten** entre reinicios del servidor

**Usuarios de prueba (mock):**
| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Sebastian | seba@test.com | seba123 | admin |
| diego | diego@deathcloud.com | admin123 | admin |

---

## Inicialización de la DB real

Con la VPN activa y `.env` configurado:

```bash
cd backend
node init_db.js
```

Esto crea automáticamente:
- Tabla `usuarios` con todas las columnas
- Tabla `mensajes` (chat)
- Tabla `amigos`
- Tabla `tickets`
- Esquemas `runner`, `skies`, `2d` con tablas `user_credits`, `user_skins`, `user_stats`
- Datos seed del leaderboard para cada juego

---

## Conexión VPN

El servidor de base de datos está en `192.168.50.24` (Ubuntu Server 24.04, PostgreSQL 16).  
Para conectarse hay que estar en la red de la universidad o tener activa la VPN de la institución.
