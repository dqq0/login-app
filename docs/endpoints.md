# 📡 API Endpoints — DeathCloud Platform

Base URL (desarrollo): `http://localhost:3000`  
Servidor VPN: `http://192.168.50.24:3000`

> Para rutas **protegidas** incluir header: `Authorization: Bearer <jwt_token>`

---

## 🔐 Autenticación

| Método | Endpoint | Descripción | Body |
|---|---|---|---|
| POST | `/api/register` | Registrar nuevo piloto | `{ username, email, password }` |
| POST | `/api/login` | Iniciar sesión | `{ email, password }` |

**Respuesta login exitoso:**
```json
{
  "success": true,
  "username": "Sebastian",
  "nickname": "Sebastian",
  "rol": "admin",
  "token": "<jwt>"
}
```

---

## 👤 Perfil de Usuario

| Método | Endpoint | Descripción | Auth | Body |
|---|---|---|---|---|
| GET | `/api/profile` | Obtener perfil propio | ✅ | — |
| PUT | `/api/profile` | Actualizar avatar, bio, nickname | ✅ | `{ avatar_url, bio, nickname }` |
| PUT | `/api/profile/password` | Cambiar contraseña | ✅ | `{ oldPassword, newPassword }` |
| PUT | `/api/profile/deathcloud-id` | Cambiar DeathCloud ID | ✅ | `{ password, newDeathCloudId }` |
| GET | `/api/profile/public/:username` | Ver perfil público de otro piloto | ❌ | — |

---

## 🎮 Juego (por `:gameId`)

`gameId` válidos: `deathcloud-runner` · `deathcloud-toxic-skies` · `deathcloud-2d`

| Método | Endpoint | Descripción | Auth | Body |
|---|---|---|---|---|
| GET | `/api/game/:gameId/leaderboard` | Clasificación top del juego | ❌ | — |
| GET | `/api/game/:gameId/credits` | Balance de E-Points del usuario | ✅ | — |
| POST | `/api/game/:gameId/credits/add` | Añadir E-Points (compra de paquete) | ✅ | `{ amount }` |
| GET | `/api/game/:gameId/skins` | Skins adquiridas por el usuario | ✅ | — |
| POST | `/api/game/:gameId/skins/buy` | Comprar una skin | ✅ | `{ skinId, price }` |
| POST | `/api/game/:gameId/stats` | Guardar/actualizar puntaje | ✅ | `{ score }` |

---

## 👥 Amigos

| Método | Endpoint | Descripción | Auth | Body |
|---|---|---|---|---|
| GET | `/api/friends` | Listar amigos y solicitudes pendientes | ✅ | — |
| POST | `/api/friends/request` | Enviar solicitud de amistad | ✅ | `{ friendUsername }` |
| POST | `/api/friends/respond` | Aceptar o rechazar solicitud | ✅ | `{ requestId, action: 'aceptado'|'rechazado' }` |
| DELETE | `/api/friends/:id` | Eliminar amigo | ✅ | — |

---

## 🎫 Tickets de Soporte

| Método | Endpoint | Descripción | Auth | Body |
|---|---|---|---|---|
| GET | `/api/tickets` | Ver mis tickets | ✅ | — |
| POST | `/api/tickets` | Crear ticket nuevo | ✅ | `{ title, description, category, priority }` |

**Categorías válidas:** `cuenta` · `bug` · `tienda` · `otro`  
**Prioridades válidas:** `baja` · `media` · `alta` · `critica`

---

## 🛡️ Administración

| Método | Endpoint | Descripción | Auth | Body |
|---|---|---|---|---|
| GET | `/api/admin/users` | Listar todos los usuarios | ✅ Admin | — |
| PUT | `/api/admin/users/:id/ban` | Banear/desbanear usuario | ✅ Admin | `{ baneado, motivo_ban }` |
| PUT | `/api/admin/users/:id/role` | Cambiar rol de usuario | ✅ Admin | `{ rol }` |

---

## ⚙️ Notas

- **Modo Mock**: Si PostgreSQL no está disponible, el backend activa modo in-memory automáticamente
- **Socket.io**: Chat en tiempo real en el mismo puerto. Eventos: `enviar_mensaje`, `recibir_mensaje`, `historial_mensajes`
- **CORS**: Configurado para `http://localhost:5173` en DEV. Cambiar `FRONTEND_URL` en `.env` para producción
