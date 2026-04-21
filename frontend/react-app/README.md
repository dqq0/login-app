# 🌐 Game Platform Launcher UI

Bienvenido al frontend del Lanzador de Juegos Base. Construido con **React, Vite, Context API y Tailwind CSS**.

Esta plataforma cuenta con un diseño de **Esqueleto Agnóstico** con arquitectura responsiva (glassmorphism/estilo cyberpunk/neumórfico adaptable) pensado en la escalabilidad absoluta. Utiliza a "Death Cloud" internamente como un simple tema o juego de demostración para probar las capacidades del motor.

> [!TIP]
> **Totalmente Desacoplado y Listo para Múltiples Juegos**
> Si clonas o haces fork a este repositorio, **no necesitas modificar componentes React para cambiar los colores o texturas**. La plataforma se ajustará instantáneamente al tema y metadatos del juego ingresado.

## 🎨 Cambiando el Diseño y Contenido (Tema y Datos)

Cualquier usuario o desarrollador que utilice este repositorio puede customizar completamente el proyecto (colores, fondos, nombres, tienda, noticias) modificando **un solo archivo**, sin tocar las vistas de React ni el CSS del esqueleto:

1. Abre `src/config/gamesData.js`
2. Modifica o crea un nuevo objeto en el arreglo devolviendo el `id`, los esquemas de color `theme-*` (en formado estrictamente RGB como `"0 243 255"` para soportar cálculos de opacidad de Tailwind), y las tuplas de Arrays (leaderboard, noticias y tienda).
3. Selecciona tu juego u oblígalo como principal en el estado base de `src/context/GameContext.jsx`. Todo nuestro esqueleto absorberá y mapeará dinámicamente tu JSON inyectando **Variables CSS** en el `:root`, lo que disparará el redibujado de la UI entera (bordes vítreos, brillos de botones, fondos heroicos).

## 🚀 Ejecutar Localmente

### 1. Instalación de Dependencias
Abre una terminal en esta carpeta (`frontend\react-app\`) e instala los paquetes:

```bash
npm install
```

### 2. Arrancar el Entorno de Desarrollo
```bash
npm run dev
```
*(Puedes abrir la aplicación directamente en tu navegador en `http://localhost:5173/` o en el puerto sugerido)*


## 🔌 Conexión con el Backend

Actualmente, este frontend está preparado con una arquitectura limpia para ser enlazado a un backend. El entorno se conecta de dos formas al servidor actual provisto en `../backend`:

### API REST Clásica (Autenticación y Registros)
El backend cuenta con Endpoints básicos en `http://localhost:3000/api/`:
- **POST `/api/register`**: Para registrar una cuenta nueva.
- **POST `/api/login`**: Valida las credenciales y debe devolver un "Token" (ej, JWT).
  
Para consumir esto desde React en una arquitectura seria, te sugerimos utilizar `fetch` o instalar `axios` aislando peticiones asíncronas dentro de una carpeta `/services` en `src`.

### WebSockets (Socket.io) para Chat en Vivo
La aplicación Frontend incluye `socket.io-client` y un componente de chat global en vivo (`src/components/chat/LiveChatPanel.jsx`). 
Para activarlo, debes conectarlo al puerto e interactuar con los eventos del servidor:
- **Eventos que escucha el backend**: `enviar_mensaje`
- **Eventos que emite el backend**: `historial_mensajes`, `recibir_mensaje`

## 🏗️ Sugerencias Arquitectónicas (Backend Profesional)

El simulador backend incluido localmente es ultra básico y monolítico. Si el objetivo escalar la plataforma (ej. estilo Client de Riot), la arquitectura ideal se vería así:

1. **Desacoplamiento (Servidores Específicos)**:
   - **Servidor Web / API REST**: Desarrollado en lenguajes escalables (Sugerencia: NestJS o Go). Manejará Autenticación y Tienda.
   - **Servidor Social de Chat**: Instancia independiente (p. ej. *Redis Pub/Sub* enlazado con *WebSocket*) construida sola para escalar mensajería y clanes.
   - **Game Server Dedicado**: Encargado absoluto del networking de físicas de combate y posición (C++, o C# Unity Netcode trabajando sobre túneles UDP para asegurar latencias mínimas debajo de 40ms en *Tick Rate* altos).
2. **Seguridad Stateless Inquebrantable**: Utilización de *JWT (JSON Web Tokens) HttpOnly* para autorizar transacciones monetarias dentro del Game Launcher sin exponer sesiones estáticas.
