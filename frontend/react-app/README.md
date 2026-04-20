# Death Cloud - Game Launcher Frontend

Este es el frontend de la plataforma "Death Cloud" (Game Launcher y Dashboard). Construido con React, Vite y estilizado exclusivamente con Vanilla CSS (mediante variables) + utilidades de Tailwind para una estética moderna y "cyberpunk".

## Ejecutar Localmente

### 1. Instalación de Dependencias
Abre una terminal en esta carpeta (\`frontend\react-app\`) e instala los paquetes:

\`\`\`bash
npm install
\`\`\`

### 2. Arrancar el Entorno de Desarrollo
\`\`\`bash
npm run dev
\`\`\`
*(Puedes abrir la aplicación directamente en tu navegador en `http://localhost:5173/`)*


## 🔌 Conexión con el Backend

Actualmente, este frontend está preparado con una arquitectura limpia para ser enlazado a un backend.

El entorno se conecta principalmente de dos formas al servidor actual provisto en \`../backend\`:

### API REST Clásica (Autenticación y Registros)
El backend cuenta con Endpoints básicos en \`http://localhost:3000/api/\`:
- **POST `/api/register`**: Para registrar una cuenta nueva.
- **POST `/api/login`**: Valida las credenciales y debe devolver un "Token" (ej, JWT).
  
Para consumir esto desde React, te sugerimos utilizar \`fetch\` o instalar \`axios\` en peticiones asíncronas dentro de una carpeta \`/services\` en `src`.

### WebSockets (Socket.io) para Chat en Vivo
La aplicación Frontend ya posee en paquete `socket.io-client` y un componente de chat en vivo (\`src/components/chat/LiveChatPanel.jsx\`). 
Para activarlo, debes conectarlo al puerto correcto e interactuar con los eventos que tiene programados el servidor:
- **Eventos que escucha el backend**: \`enviar_mensaje\`
- **Eventos que emite el backend**: \`historial_mensajes\`, \`recibir_mensaje\`

## 🚀 Sugerencias Arquitectónicas Backend Profesionales

El backend incluido es ultra básico y monolítico (un solo archivo `server.js` maneja todo). Si quieres llevar este juego a nivel de producción constante y masiva, la arquitectura ideal sería la siguiente:

### 1. Desacoplamiento (Servidores de State)
- El **Servidor Web / API REST** deberías construirlo con frameworks eficientes (Sugerencia: **NestJS** en Typescript, o **Go** (Golang)). Esta API solo manejaría la Autenticación de las cuentas de Riot, Perfil de Usuario y Compras de la Tienda.
- El **Servidor de Chat/Social** debe ser independiente para no bloquear recursos (se puede construir con Redis Pub/Sub con WebSocket).
- El **Servidor de Partidas (Game Server)** debe estar en otra instancia completamente (C++, C# Unity Netcode como mencionaste en planes anteriores) utilizando UDP preferentemente y no TCP como los requerimientos web.

### 2. Autenticación y Seguridad Real (Stateless)
- Remover credenciales quemadas o autenticación en texto plano.
- Transicionar a **JWT (JSON Web Tokens)** integrados en los Headers HTTP (\`Authorization: Bearer <TKN>\`) y guardados de manera segura en el cliente (ej. \`HttpOnly Cookies\` o Zustand Persist encripatdo) para autorizar compras.

### 3. Migración de Base de Datos
Se detecta configuración "pool" (Postgres). Para agilización, recomendamos acoplar Prisma ORM o TypeORM en la lógica de NodeJS para estandarizar las entidades o modelos de la Tienda (Ej: Armas, Monedas, Jugador, Historial de Pagos).
