# DOCUMENTACIÓN TÉCNICA DE ARQUITECTURA E INFRAESTRUCTURA BASE

**Sistema de Autenticación y Comunicación en Tiempo Real**

---

| Campo         | Detalle                                    |
|---------------|--------------------------------------------|
| **Proyecto**  | Deathcloud Login App                       |
| **Materia**   | Sistemas Operativos y Redes                |
| **Fecha**     | Mayo 2026                                  |
| **Estado**    | Finalizado & Validado — Sprint 0           |
| **Versión**   | v2.0 — JWT Enabled                         |
| **Servidor**  | Ubuntu Server — `192.168.50.24`            |

---

## 1. Objetivos y Alcance

Esta fase inicial (Sprint 0) establece las bases arquitectónicas de red, lógica de servicios y persistencia para una aplicación full-stack de **autenticación de usuarios** y **comunicación interactiva en tiempo real**. El criterio central es el despliegue **nativo** sobre Ubuntu Server, prescindiendo de tecnologías de contenerización para demostrar administración directa del kernel Linux y diseño de redes a nivel de proceso.

### Hitos Logrados

| # | Hito | Tecnología clave |
|---|------|-----------------|
| 1 | **Aislamiento de Entornos** — Arquitectura dual DEV/PROD coexistiendo en un mismo SO mediante segmentación de puertos y variables de entorno | `.env.dev` / `.env.prod` |
| 2 | **Motor Backend Robustecido** — API REST stateless con JWT, hash bcrypt y canal dúplex WebSocket | Node.js, Express.js v5, Socket.io v4 |
| 3 | **Migración Frontend a React + Vite** — SPA completa con UI Cyberpunk/Glassmorphism | React 19, Vite 8, Tailwind 3 |
| 4 | **Soporte Multiplataforma dinámico** — Detección automática de protocolo para Web y Android WebView | `window.location.protocol`, `import.meta.env` |
| 5 | **Diseño de Integración Móvil** — Adaptación y documentación para encapsulamiento en Android Studio | Android `WebView`, `AndroidManifest.xml` |

---

## 2. Stack Tecnológico

### 2.1 Backend

| Paquete | Versión | Rol |
|---------|---------|-----|
| `node` | Runtime LTS | Motor de ejecución asíncrona |
| `express` | `^5.2.1` | Framework HTTP / Router REST |
| `socket.io` | `^4.8.3` | Servidor WebSocket bidireccional |
| `bcryptjs` | `^3.0.3` | Hashing criptográfico de contraseñas |
| `jsonwebtoken` | `^9.0.3` | Generación y verificación de tokens JWT |
| `pg` | `^8.20.0` | Driver PostgreSQL (connection pool) |
| `dotenv` | `^16.6.1` | Carga de variables de entorno |
| `cors` | `^2.8.6` | Middleware de política de origen cruzado |

**Scripts npm:**
```bash
npm start      # node server.js          (Producción)
npm run dev    # node --watch server.js  (Desarrollo, hot-reload nativo)
```

### 2.2 Frontend

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react` | `^19.2.4` | Librería de UI basada en componentes |
| `react-dom` | `^19.2.4` | Renderizado al DOM |
| `react-router-dom` | `^7.14.1` | Enrutamiento SPA del lado del cliente |
| `socket.io-client` | `^4.8.3` | Cliente WebSocket (par del servidor) |
| `react-icons` | `^5.6.0` | Iconografía SVG (Feather Icons) |
| `vite` | `^8.0.1` | Bundler y servidor de desarrollo con HMR |
| `tailwindcss` | `^3.4.19` | Framework CSS utilitario |
| `clsx` + `tailwind-merge` | `^2.1.1` / `^3.5.0` | Composición condicional de clases CSS |

---

## 3. Arquitectura de Red y Topología de Puertos

El sistema prescinde de contenedores para operar directamente sobre el kernel Linux. El tráfico externo es interceptado en la **Capa 7 (Aplicación)** por Nginx configurado como Reverse Proxy y servidor de archivos estáticos.

```
       [ CLIENTE (Navegador Web / Android WebView) ]
                            │
              Petición HTTP / WebSocket (Puerto 80)
                            ▼
            ┌─────────────────────────────┐
            │     NGINX REVERSE PROXY     │
            │  (Capa 7 — L7 Application)  │
            └───────────┬─────────────────┘
                        │ Redireccionamiento por rutas
         ┌──────────────┴──────────────┐
         ▼                             ▼
   / (Ruta Raíz)              /api/  y  /socket.io/
[ FRONTEND REACT ]            [ BACKEND NODE.JS ]
Archivos estáticos           PM2 — Puerto 4000 (PROD)
 servidos desde              Puerto 3000 (DEV, directo)
  react-app/dist/
                                        │
                              Conexión TCP local :5432
                                        ▼
                               [ POSTGRESQL ]
                           death_cloud_dev  (DEV)
                           death_cloud_prod (PROD)
```

### 3.1 Tabla de Puertos por Entorno

| Entorno | Componente | Puerto Interno | Puerto Externo | Base de Datos |
|---------|-----------|---------------|---------------|---------------|
| **DEV** | Frontend (Vite Dev Server) | `5173` | `8080` (Nginx) | `death_cloud_dev` |
| **DEV** | Backend (Node.js) | `3000` | `3000` (Directo) | `death_cloud_dev` |
| **PROD** | Frontend (React `dist/`) | N/A | `80` (Nginx estático) | `death_cloud_prod` |
| **PROD** | Backend (Node.js + PM2) | `4000` | `80` (Proxied `/api`) | `death_cloud_prod` |
| Ambos | PostgreSQL | `5432` | No expuesto | — |

### 3.2 Configuración Nginx — Ruteo de Producción

```nginx
# Sirve el frontend React (dist/) en la raíz
location / {
    root /ruta/al/frontend/react-app/dist;
    try_files $uri $uri/ /index.html;
}

# Proxy inverso hacia el backend Node.js en puerto 4000
location /api/ {
    proxy_pass http://localhost:4000;
}

# Proxy WebSocket hacia Socket.io
location /socket.io/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 3.3 Proxy de Desarrollo — Vite (`vite.config.js`)

Durante el desarrollo, Vite actúa como proxy local hacia el backend en `localhost:3000`, evitando errores CORS:

```js
// frontend/react-app/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':       { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', ws: true }
    }
  }
})
```

---

## 4. Variables de Entorno

El backend utiliza archivos `.env` independientes por entorno, inyectados en tiempo de ejecución por PM2 o `dotenv`.

### `.env.dev`
```env
PORT=3000
DB_USER=diego
DB_HOST=localhost
DB_NAME=death_cloud_dev
DB_PASSWORD=admin123
DB_PORT=5432
JWT_SECRET=deathcloud-secret-key-dev-2026
NODE_ENV=development
```

### `.env.prod`
```env
PORT=4000
DB_USER=diego
DB_HOST=localhost
DB_NAME=death_cloud_prod
DB_PASSWORD=admin123
DB_PORT=5432
JWT_SECRET=deathcloud-secret-key-prod-2026
NODE_ENV=production
```

### Variables Vite — Frontend

| Variable | Valor DEV | Valor PROD | Uso |
|----------|-----------|------------|-----|
| `VITE_API_URL` | `http://localhost:3000/api` | *(relativa)* | URL absoluta para Android WebView |

---

## 5. Backend — Capa de Servicios

### 5.1 Estructura de Archivos

```
backend/
├── server.js               # Entry point: Express + Socket.io + initDB
├── config/
│   └── db.js               # Pool de conexión PostgreSQL (pg.Pool)
├── controllers/
│   └── authController.js   # Lógica de registro y login
├── middleware/
│   └── authMiddleware.js   # Verificación de JWT (Bearer token)
├── routes/
│   └── authRoutes.js       # Definición de rutas REST
├── .env.dev
└── .env.prod
```

### 5.2 Pool de Conexión a PostgreSQL (`config/db.js`)

```js
const { Pool } = require('pg');
const pool = new Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'app_db',
  password: process.env.DB_PASSWORD || '',
  port:     process.env.DB_PORT     || 5432
});
module.exports = pool;
```

El módulo exporta el `pool` compartido entre `server.js` y `authController.js`, evitando abrir múltiples conexiones por petición.

### 5.3 Endpoints REST (`/api`)

#### `POST /api/register`
Registra un nuevo usuario. Verifica unicidad de email y nombre de usuario antes de persistir.

```
Flujo:
  1. Verifica duplicado → SELECT WHERE email=$1 OR nombre_usuario=$2
  2. Genera salt:  bcrypt.genSalt(10)
  3. Hashea:       bcrypt.hash(password, salt)       → $2a$10$...
  4. Persiste:     INSERT INTO usuarios (nombre_usuario, email, clave_encriptada)
  5. Responde:     { success: true, user: { id, username } }
```

**Respuestas:**
| Código | Condición | Body |
|--------|-----------|------|
| `200` | Registro exitoso | `{ success: true, message: "Registro exitoso", user: { id, username } }` |
| `400` | Usuario/email duplicado | `{ success: false, message: "El usuario o email ya están registrados" }` |
| `500` | Error interno | `{ success: false, message: "Error interno del servidor" }` |

---

#### `POST /api/login`
Autentica a un usuario y emite un JWT firmado.

```
Flujo:
  1. Busca usuario:    SELECT * FROM usuarios WHERE email=$1
  2. Compara hash:     bcrypt.compare(password, clave_encriptada)
  3. Firma token:      jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '24h' })
  4. Responde:         { success: true, username, token }
```

**Respuestas:**
| Código | Condición | Body |
|--------|-----------|------|
| `200` | Login exitoso | `{ success: true, message: "Acceso concedido", username, token }` |
| `400` | Credenciales inválidas | `{ success: false, message: "Credenciales inválidas" }` |
| `500` | Error interno | `{ success: false, message: "Error interno del servidor" }` |

---

#### Middleware de Autenticación (`authMiddleware.js`)

Protege rutas privadas verificando el token Bearer en el header `Authorization`:

```
Header esperado:  Authorization: Bearer <jwt_token>

Flujo:
  1. Extrae token del header
  2. jwt.verify(token, JWT_SECRET) → decodifica payload { id, username, iat, exp }
  3. Attach a req.user → siguiente middleware/controlador
  4. Si inválido/expirado → 403 Forbidden
```

### 5.4 Canal WebSocket — Socket.io (`server.js`)

El servidor Socket.io se monta sobre el mismo `http.Server` de Express, compartiendo el puerto de aplicación.

```
Configuración CORS Socket.io:
  origin:  "*"           (abrir en fase de desarrollo)
  methods: ["GET", "POST"]

Evento: connection
  └─ Query: SELECT usuario, texto, hora FROM mensajes ORDER BY id ASC LIMIT 100
  └─ Emite: historial_mensajes → [ { usuario, texto, hora }, ... ]

Evento: enviar_mensaje  (cliente → servidor)
  └─ INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)
  └─ io.emit: recibir_mensaje → broadcast a TODOS los sockets activos

Evento: disconnect
  └─ Log: 🔴 Piloto desconectado
```

**Ventaja vs HTTP Polling:** Socket.io mantiene una conexión TCP persistente. Los mensajes se retransmiten en milisegundos sin overhead de cabeceras HTTP repetidas por cada mensaje.

### 5.5 Inicialización Automática de Esquema (`initDB`)

Al arrancar, `server.js` ejecuta `CREATE TABLE IF NOT EXISTS` para garantizar que el esquema exista sin intervención manual:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id               SERIAL PRIMARY KEY,
  nombre_usuario   VARCHAR(50)  UNIQUE NOT NULL,
  email            VARCHAR(100) UNIQUE NOT NULL,
  clave_encriptada VARCHAR(255) NOT NULL,
  fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
  id      SERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  texto   TEXT         NOT NULL,
  hora    VARCHAR(50)  NOT NULL
);
```

---

## 6. Base de Datos — PostgreSQL (Multi-Database & Multi-Esquema)

### 6.1 Parámetros de Conexión e Infraestructura

El motor PostgreSQL (`5432`) corre de forma nativa. Con el fin de emular el comportamiento de grandes plataformas de videojuegos (como Riot Games o Epic Games), la persistencia de datos se divide en dos capas:
1. **Base de Datos Principal (`death_cloud_dev` / `death_cloud_prod`):** Almacena las cuentas de usuario (`usuarios`), amigos (`amigos`), tickets de soporte (`tickets`) y chat global (`mensajes`).
2. **Bases de Datos de Juego Individuales (`death_cloud_runner`, `death_cloud_skies`, `death_cloud_2d`):** Almacenan de forma aislada los E-Points (`user_credits`), las skins compradas (`user_skins`) y las estadísticas de puntuación (`user_stats`) de cada sección de juego.

### 6.2 Resiliencia y Niveles de Fallback Automático

Para garantizar que el backend no falle ni se congele ante problemas de red o restricciones de privilegios de base de datos, el archivo `config/db.js` implementa un flujo de tres niveles:
1. **Nivel 1 (Bases de Datos Independientes):** El backend intenta abrir pools de conexión independientes para cada juego (`death_cloud_runner`, `death_cloud_skies` y `death_cloud_2d`).
2. **Nivel 2 (Esquemas Lógicos de Respaldo):** Si el servidor de bases de datos no tiene creadas las bases específicas y el usuario no dispone de permisos, el backend atrapa la excepción y configura de forma transparente **esquemas aislados** (`runner`, `skies`, `2d`) dentro de la base de datos principal (`death_cloud_dev`).
3. **Nivel 3 (Modo Simulador Local en Memoria - Bypass VPN):** Si toda la base de datos es inaccesible o la conexión sufre de timeout (`connect ETIMEDOUT` por VPN apagada), el backend intercepta el error globalmente y conmuta automáticamente a un **Modo Simulador en Memoria**. Esto le permite continuar respondiendo de inmediato con datos simulados y persistencia en memoria local, evitando cualquier bloqueo del cliente.

### 6.3 Esquema de Tablas por Capa

#### Tablas Compartidas (Base de Datos Principal - Esquema `public`)
*   `usuarios` (id, nombre_usuario, email, clave_encriptada, rol, avatar_url, nickname, bio, fecha_creacion)
*   `mensajes` (id, usuario, texto, hora)
*   `amigos` (id, usuario_id_envia, usuario_id_recibe, estado, fecha_solicitud)
*   `tickets` (id, usuario_id, titulo, descripcion, categoria, estado, prioridad, fecha_creacion)

#### Tablas de Juego (Bases de Datos de Juego / Esquemas `runner`, `skies`, `2d`)
*   `user_credits` (usuario_id INT PRIMARY KEY, credits INT DEFAULT 2500)
*   `user_skins` (id SERIAL PRIMARY KEY, usuario_id INT, skin_id VARCHAR(100), fecha_adquisicion TIMESTAMP)
*   `user_stats` (usuario_id INT PRIMARY KEY, score VARCHAR(50), fecha_actualizacion TIMESTAMP)


---

## 7. Frontend — SPA React + Vite

### 7.1 Estructura de Componentes

```
frontend/react-app/src/
├── main.jsx                      # Entry point — ReactDOM.createRoot
├── App.jsx                       # Raíz: Router + auth state (localStorage)
├── Login.jsx                     # Vista de autenticación (login + register)
├── Chat.jsx                      # (Versión legacy — chat standalone)
├── views/
│   └── Dashboard.jsx             # Vista principal post-login: Hero + Widgets
├── components/
│   ├── layout/
│   │   └── MainLayout.jsx        # Layout global: Sidebar + Header + outlet
│   ├── chat/
│   │   └── LiveChatPanel.jsx     # Panel lateral de chat en tiempo real (Socket.io)
│   ├── ui/                       # Componentes atómicos reutilizables
│   └── widgets/                  # Widgets del Dashboard (Leaderboard, Store, News)
├── context/
│   └── GameContext.jsx           # Contexto global de datos del juego activo
└── config/
    └── gamesData.js              # Catálogo de juegos y assets temáticos
```

### 7.2 Gestión de Estado de Autenticación (`App.jsx`)

El estado de sesión es **stateless en el servidor** y persistido en el cliente mediante `localStorage`:

```
Al montar:
  1. localStorage.getItem('username') + localStorage.getItem('jwt_token')
  2. Si ambos existen → setUser({ username, token }) → Dashboard
  3. Si no → Login

Al hacer login exitoso:
  1. API responde { success, username, token }
  2. localStorage.setItem('username', ...) + setItem('jwt_token', ...)
  3. setUser() → redirige a Dashboard

Al hacer logout:
  1. localStorage.removeItem('username') + removeItem('jwt_token')
  2. setUser(null) → redirige a Login
```

### 7.3 Enrutamiento SPA (`react-router-dom v7`)

```
Rutas definidas en App.jsx:
  /           → <Dashboard />        (vista principal con widgets)
  /ranking    → Ranking Global       (placeholder — próximo sprint)
  /comunidad  → Comunidad            (placeholder — próximo sprint)
  /tienda     → Tienda Freemium      (placeholder — próximo sprint)
  /*          → <Navigate to="/" />  (catch-all)
```

### 7.4 Detección Dinámica de Protocolo — Soporte Multiplataforma

`LiveChatPanel.jsx` implementa detección automática del entorno de ejecución:

```js
// frontend/react-app/src/components/chat/LiveChatPanel.jsx
const getSocketUrl = () => {
  if (window.location.protocol !== 'file:') {
    return undefined; // Socket.io usa el origen relativo → funciona en Web + Nginx
  }
  // Android WebView (file:///android_asset/...) → URL absoluta desde .env
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace('/api', '');
};
```

| Entorno | Protocolo detectado | URL Socket | Mecanismo |
|---------|-------------------|------------|-----------|
| Navegador Web (DEV) | `http:` / `https:` | Relativa (origen) | Proxy Vite → `localhost:3000` |
| Navegador Web (PROD) | `http:` | Relativa (origen) | Nginx Reverse Proxy → `localhost:4000` |
| Android WebView | `file:` | `http://10.0.2.2:PORT` | `VITE_API_URL` en `.env` |

### 7.5 Diseño Visual — Sistema de Tokens CSS

| Token | Descripción |
|-------|------------|
| `--theme-neon` / `text-theme-neon` | Color acento principal (`#00f3ff` — cian neón) |
| `--theme-dark` | Fondo oscuro base del panel |
| `backdrop-blur-2xl` | Efecto Glassmorphism en paneles |
| `shadow-neon` | Sombra de brillo neón en elementos activos |
| `font-display` | Tipografía `Orbitron` (titulares técnicos) |
| `font-body` | Tipografía `Outfit` (texto general) |
| `glass-panel` | Clase compuesta: fondo translúcido + borde neón sutil |
| `animate-pulse` | Indicador de estado de conexión activo |

---

## 8. Administración del Servidor — Ubuntu Linux

### 8.1 Gestión de Procesos con PM2

PM2 (Process Manager 2) garantiza la ejecución persistente del backend independiente de la sesión SSH:

```bash
# Iniciar entorno de PRODUCCIÓN
pm2 start server.js --name login-back-prod -- --env-file=.env.prod

# Iniciar entorno de DESARROLLO (si aplica en servidor)
pm2 start server.js --name login-back-dev  -- --env-file=.env.dev

# Comandos de gestión
pm2 list              # Ver todos los procesos activos
pm2 logs              # Ver logs en tiempo real (todos los procesos)
pm2 logs login-back-prod  # Logs específicos de producción
pm2 restart login-back-prod
pm2 stop    login-back-prod
pm2 save              # Guardar estado para reinicio automático al bootear
pm2 startup           # Configurar inicio automático con el sistema
```

**Estado visible en producción (`pm2 list`):**
```
┌──┬──────────────────┬─────────┬────────┬──────┬───────────┬──────┐
│id│ name             │ status  │ cpu    │ mem  │ uptime    │ port │
├──┼──────────────────┼─────────┼────────┼──────┼───────────┼──────┤
│0 │ login-back-prod  │ online  │ 0%     │ ~50mb│ Xd Xh     │ 4000 │
│1 │ login-back-dev   │ online  │ 0%     │ ~45mb│ Xd Xh     │ 3000 │
└──┴──────────────────┴─────────┴────────┴──────┴───────────┴──────┘
```

### 8.2 Servidor IP y Acceso

| Dato | Valor |
|------|-------|
| IP del servidor Ubuntu | `192.168.50.24` |
| URL entorno DEV | `http://192.168.50.24:8080` |
| URL entorno PROD | `http://192.168.50.24` (puerto 80) |
| Acceso SSH | `ssh icin@192.168.50.24` |
| Puerto PostgreSQL | `5432` (acceso desde DBeaver via red local) |

---

## 9. Integración Móvil — Android Studio (Próximo Sprint)

La SPA está diseñada para ser encapsulada en una aplicación Android nativa mediante el componente `WebView`.

### 9.1 Permisos de Red — `AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permisos de red -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:theme="@style/Theme.Deathcloud"
        android:usesCleartextTraffic="true">  <!-- HTTP sin TLS en fase de pruebas -->
        ...
    </application>
</manifest>
```

### 9.2 Configuración del WebView — `MainActivity.kt`

```kotlin
class MainActivity : AppCompatActivity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val myWebView = WebView(this)
        setContentView(myWebView)

        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true      // Ejecutar React
        webSettings.domStorageEnabled = true      // localStorage → JWT
        webSettings.allowFileAccess = true
        webSettings.allowFileAccessFromFileURLs = true
        webSettings.allowUniversalAccessFromFileURLs = true

        myWebView.webViewClient = WebViewClient()
        myWebView.loadUrl("file:///android_asset/frontend/index.html")
    }
}
```

### 9.3 Resolución de IP en Emulador Android

| Entorno | IP a usar | Razón |
|---------|-----------|-------|
| Emulador oficial Android Studio | `10.0.2.2` | El emulador no puede resolver `localhost` del host |
| Dispositivo físico (USB/WiFi) | `192.168.X.X` | IP local del equipo de desarrollo en la red |
| Servidor remoto (PROD) | `192.168.50.24` | IP real del Ubuntu Server |

### 9.4 Estructura de Assets en Android

```
app/src/main/assets/
└── frontend/
    ├── index.html
    └── (archivos compilados de React — dist/)
```

---

## 10. Flujo Completo de Datos — Diagrama de Secuencia

### Registro de Usuario

```
Cliente                    Express REST              PostgreSQL
   │                            │                        │
   │── POST /api/register ──────►│                        │
   │   { username, email,        │── SELECT (duplicado) ──►│
   │     password }              │◄──────────────────────┤
   │                            │── bcrypt.genSalt(10)   │
   │                            │── bcrypt.hash()        │
   │                            │── INSERT usuarios ─────►│
   │◄── { success, user.id } ───│                        │
```

### Login y Emisión de JWT

```
Cliente                    Express REST              PostgreSQL
   │                            │                        │
   │── POST /api/login ─────────►│                        │
   │   { email, password }       │── SELECT usuarios ─────►│
   │                            │◄── { user row } ───────┤
   │                            │── bcrypt.compare()     │
   │                            │── jwt.sign({ id, username }, SECRET, 24h)
   │◄── { success, token } ─────│                        │
   │                            │                        │
   │  localStorage.setItem('jwt_token', token)           │
```

### Chat en Tiempo Real

```
Cliente A         Socket.io Server           PostgreSQL        Cliente B
   │                    │                        │                  │
   │── connect ─────────►│                        │                  │
   │                    │── SELECT mensajes ─────►│                  │
   │◄── historial_mensajes (últimos 100) ─────────│                  │
   │                    │                        │                  │
   │── enviar_mensaje ──►│                        │                  │
   │   { usuario, texto,│── INSERT mensajes ─────►│                  │
   │     hora }         │◄────────────────────────│                  │
   │                    │────── recibir_mensaje ──────────────────────►│
   │◄── recibir_mensaje ┤   (broadcast io.emit)   │                  │
```

---

## 11. Conclusión

La infraestructura del Sprint 0 de **Deathcloud Login App** se encuentra operativa y validada. Los pilares técnicos implementados son:

1. **Seguridad**: Contraseñas nunca almacenadas en texto plano (Bcrypt factor 10). Sesiones stateless mediante JWT firmado con secreto de entorno.
2. **Red**: Reverse Proxy Nginx distribuyendo tráfico HTTP y WebSocket en un único puerto público. Aislamiento estricto DEV/PROD mediante segmentación de puertos y bases de datos.
3. **Tiempo Real**: Canal WebSocket persistente (Socket.io) eliminando el sobrecoste del HTTP polling para mensajería.
4. **Portabilidad**: Detección dinámica de protocolo que permite al mismo bundle React funcionar en navegador web, proxy Nginx y Android WebView sin modificar código fuente.
5. **Administración**: Procesos gestionados por PM2 con arranque automático, logging centralizado y reinicio ante fallos.
