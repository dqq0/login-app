# 📡 Documentación de Endpoints (API) - Death Clouds

Este documento detalla las rutas de acceso del servidor para interactuar con la red DeathCloud.

## 🔐 Rutas de Autenticación (`/api/*`)

| Método | Endpoint | Acción | Parámetros sugeridos (JSON) | Protegido |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Inicia sesión del usuario | `{ "email", "password" }` | No |
| **POST** | `/api/register` | Crea una cuenta nueva | `{ "username", "email", "password" }` | No |

## 👤 Rutas de Perfil (`/api/profile/*`)

| Método | Endpoint | Acción | Parámetros sugeridos (JSON) | Protegido |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/profile` | Obtiene el perfil del usuario activo | Ninguno | Sí (JWT) |
| **PUT** | `/api/profile` | Actualiza avatar, bio y nickname | `{ "avatar_url", "bio", "nickname" }` | Sí (JWT) |
| **PUT** | `/api/profile/password` | Cambia la contraseña del usuario | `{ "oldPassword", "newPassword" }` | Sí (JWT) |
| **PUT** | `/api/profile/deathcloud-id` | Cambia el ID de usuario único | `{ "password", "newDeathCloudId" }` | Sí (JWT) |
| **GET** | `/api/profile/public/:username` | Obtiene el perfil público de otro piloto | Ninguno | No |

## 🎮 Rutas de Juego Individual (`/api/game/:gameId/*`)

Estas rutas permiten el aislamiento completo de datos por cada sección de juego (`deathcloud-runner`, `deathcloud-toxic-skies` y `deathcloud-2d`).

| Método | Endpoint | Acción | Parámetros sugeridos (JSON) | Protegido |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/game/:gameId/leaderboard` | Obtiene la clasificación top de ese juego | Ninguno | No |
| **GET** | `/api/game/:gameId/credits` | Obtiene los E-Points del usuario en ese juego | Ninguno | Sí (JWT) |
| **POST** | `/api/game/:gameId/credits/add` | Adiciona E-Points a la cuenta del juego | `{ "amount" }` | Sí (JWT) |
| **GET** | `/api/game/:gameId/skins` | Obtiene la lista de skins compradas en ese juego | Ninguno | Sí (JWT) |
| **POST** | `/api/game/:gameId/skins/buy` | Compra una skin de la tienda en ese juego | `{ "skinId", "price" }` | Sí (JWT) |
| **POST** | `/api/game/:gameId/stats` | Actualiza la puntuación del piloto en ese juego | `{ "score" }` | Sí (JWT) |

---

## ⚙️ Notas para Desarrolladores
- **Base URL:** El frontend apunta a `http://localhost:3000`.
- **JWT Header:** Para todas las rutas marcadas como **Protegido**, debes incluir la cabecera `Authorization: Bearer <tu_token_jwt>`.
- **Modo Local Resiliente:** Si el servidor Postgres de la VPN no está conectado o está fuera de línea, el backend continuará funcionando en modo local (in-memory) de forma automática.
