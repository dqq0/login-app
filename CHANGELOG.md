# Historial de Cambios — DeathCloud Platform

## v3.0 — Plataforma Gaming Completa (Junio 2026)

### 🆕 Nuevas Funcionalidades
- **Módulo de E-Points**: Sistema de moneda virtual por juego con compra de paquetes
- **Tienda de Skins**: Catálogo por juego con compra usando E-Points, validación de duplicados
- **Inventario en Perfil**: Tab dedicado que muestra las skins adquiridas por juego
- **Ranking / Leaderboard**: Clasificación en tiempo real por juego con datos seed iniciales
- **Sistema de Amigos**: Solicitudes, aceptación/rechazo, eliminación de amistades
- **Soporte Técnico (Tickets)**: Creación de tickets con categoría y prioridad, vista de historial
- **Panel de Administración**: Gestión de usuarios (ban, cambio de rol), acceso restringido por `rol: admin`
- **Comunidad**: Publicaciones y comentarios de la comunidad de jugadores
- **Perfil Público**: Vista del perfil de otros pilotos desde el chat o el buscador

### 🔧 Mejoras Técnicas
- **Base de datos híbrida**: Fallback automático a in-memory mock si PostgreSQL no está disponible
- **Esquemas por juego**: Tablas `user_credits`, `user_skins`, `user_stats` aisladas por esquema (runner, skies, 2d)
- **Script `init_db.js`**: Inicialización completa de todas las tablas y datos seed desde la raíz del proyecto
- **initDB() en server.js**: La DB se sincroniza automáticamente en cada arranque del servidor
- **Fix sesión**: Login ahora limpia correctamente la sesión anterior y guarda el `nickname` del servidor
- **Header refactorizado**: Modales de E-Points y buscador desacoplados del contexto CSS `backdrop-filter` para evitar clipping
- **GameContext**: Selector de juego activo compartido por toda la aplicación
- **JWT con rol y ban**: El token incluye `rol` y `baneado` para control de acceso en frontend y backend

### 🗄️ Base de Datos Real (PostgreSQL VPN)
- Servidor: `192.168.50.24` (PostgreSQL 16 / Ubuntu 24.04)
- Base principal: `death_cloud_dev`
- Tablas: `usuarios`, `mensajes`, `amigos`, `tickets`
- Esquemas: `runner.*`, `skies.*`, `2d.*` (credits, skins, stats)

---

## v2.0 — Refactorización Full Stack

- **Estructura en Capas**: Separación `frontend/` y `backend/` con arquitectura MVC
- **Backend**: Node.js + Express con controladores, rutas y config separados
- **Frontend**: Migración a React + Vite
- **Autenticación JWT**: Login seguro con bcrypt + jsonwebtoken
- **Chat en tiempo real**: Socket.io con historial persistente en DB
- **Variables de entorno**: Configuración por `.env` para DEV/PROD

---

## v1.0 — Login Básico

- Interfaz de login con HTML/CSS/JS
- Conexión a API `/api/login` para validación con JWT
- Diseño inicial con CSS custom
