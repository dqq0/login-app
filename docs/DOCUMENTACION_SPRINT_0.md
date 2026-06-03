# 📄 Documentación Técnica - Sprint 0 (Entregable Oficial)
**Proyecto:** Deathcloud Login App  
**Materia:** Sistemas Operativos y Redes  
**Fecha:** Mayo 2026  
**Estado:** Finalizado & Validado  

---

## 📌 1. Objetivos y Alcance del Sprint 0

El **Sprint 0** se centró en sentar las bases arquitectónicas, de red y de base de datos para una aplicación full-stack de autenticación y comunicación en tiempo real. Se priorizó el desarrollo bajo un enfoque de **despliegue nativo en Ubuntu Server** y **encapsulamiento móvil en Android Studio**, demostrando robustez en administración de sistemas y diseño de redes.

### Hitos Logrados:
1. **Aislamiento de Entornos:** Arquitectura dual paralela (Desarrollo y Producción) corriendo en un mismo sistema operativo mediante gestión de puertos y variables de entorno.
2. **Motor Backend Robustecido:** Implementación de API REST con sesiones stateless (JWT), encriptación de datos (Bcrypt) y canal de datos dúplex en tiempo real (Socket.io).
3. **Migración e Interfaz React + Vite:** Reescritura completa del frontend en un Single Page Application (SPA) moderno con interfaz temática Cyberpunk/Glassmorphic.
4. **Diseño de Integración Móvil:** Documentación y adaptación del código para ser embebido en Android Studio mediante `WebView` y consumo dinámico de red.

---

## 📡 2. Arquitectura de Red y Topología de Puertos

Para cumplir con los requerimientos de la asignatura de **Redes**, el proyecto rechaza el uso de contenedores y se ejecuta directamente sobre el kernel de Linux. El tráfico es interceptado y distribuido en la **Capa 7 (Aplicación)** por un servidor **Nginx** que actúa como Proxy Reverso y servidor de estáticos.

```
       [ CLIENTE (Navegador Web / Android WebView) ]
                         │
              Petición HTTP / WS (Puerto 80)
                         ▼
             ┌─────────────────────────┐
             │    NGINX REVERSE PROXY  │
             └───────────┬─────────────┘
                         │ (Redireccionamiento por rutas)
          ┌──────────────┴──────────────┐
          ▼                             ▼
   / (Ruta Raíz)                 /api/ o /socket.io/
[ FRONTEND REACT ]               [ BACKEND NODE.JS ]
Servido estáticamente          Gestionado por PM2 (Puerto 4000)
desde dist/
                                        │ (Conexión TCP Local)
                                        ▼
                                  [ DATABASE ]
                                PostgreSQL Nativo
```

### Tabla de Ruteo y Puertos por Entorno:
| Entorno | Componente | Puerto Interno | Puerto Externo (Nginx) | Base de Datos |
| :--- | :--- | :--- | :--- | :--- |
| **Desarrollo (DEV)** | Frontend (Vite) | `5173` | `8080` | `death_cloud_dev` |
| **Desarrollo (DEV)** | Backend (Node) | `3000` | `3000` (Directo) | `death_cloud_dev` |
| **Producción (PROD)** | Frontend (React dist) | N/A | `80` (HTTP estándar) | `death_cloud_prod` |
| **Producción (PROD)** | Backend (Node) | `4000` | `80` (Proxied en `/api`) | `death_cloud_prod` |

---

## ⚙️ 3. Backend (Capa de Servicios y Redes)

El backend (`backend/server.js`) está desarrollado con **Node.js** y **Express.js**, soportando flujos de datos síncronos y asíncronos.

### A. Autenticación y Seguridad Criptográfica (REST)
Los endpoints expuestos para la capa cliente son:
* **`POST /api/register`:** Recibe credenciales. Utiliza `bcryptjs` con un factor de coste (salt rounds) de `10` para generar un hash unidireccional no reversible de la contraseña antes de guardarla en PostgreSQL.
* **`POST /api/login`:** Compara las contraseñas usando `bcrypt.compare`. En caso de éxito, firma un token con `jsonwebtoken` (JWT) que codifica el `id` y `username` del usuario, con expiración de 24 horas.

### B. Comunicación Bidireccional en Tiempo Real (WebSockets)
Para optimizar el uso del ancho de banda y la latencia, el chat utiliza el protocolo **WebSocket** con la librería **Socket.io**:
1. **Carga de Historial:** Al conectarse un cliente (`connection`), el servidor ejecuta una query no bloqueante a PostgreSQL para traer los últimos 100 mensajes almacenados en la tabla `mensajes` y los envía al cliente mediante el evento `historial_mensajes`.
2. **Distribución en Tiempo Real:** Cuando un cliente emite `enviar_mensaje`, el backend persiste el mensaje de forma asíncrona en la base de datos y lo retransmite de forma inmediata a todos los clientes conectados a través del canal `recibir_mensaje`.

---

## 💻 4. Frontend (Interfaz y Lógica React)

El frontend ha sido migrado a **React + Vite**, usando una arquitectura de componentes reutilizables y layouts adaptables.

### A. Estilo Visual Cyberpunk (Neon & Glassmorphism)
* **Tipografías:** Integración de fuentes especializadas (`Orbitron` y `Outfit`) de Google Fonts para dar una apariencia técnica e industrial.
* **Diseño visual:** Implementación de tarjetas con efecto "Glassmorphism" (paneles traslúcidos con filtro `backdrop-blur` y bordes sutiles semi-transparentes) y sombras brillantes de color neón (`#00f3ff`).
* **Header Adaptable:** Header con control de navegación global, logout de usuario, indicador de red activo y botón de apertura de canal de chat en vivo.

### B. Soporte Dinámico Multiplataforma (¡Exclusivo Sprint 0!)
El frontend cuenta con detectores dinámicos de red que evitan tener que modificar el código fuente según dónde se compile. Esto soluciona de forma transparente la conexión al servidor:
* **En el Navegador (Local o Prod):** Detecta que el protocolo no es de archivo (`file:`) y realiza solicitudes relativas (ej. `/api/login` y `/socket.io`). Esto aprovecha el proxy de desarrollo de Vite o el Reverse Proxy de Nginx en producción automáticamente.
* **En Android Studio (WebView):** Detecta el protocolo local (`file:///android_asset/...`) y conmuta de manera automática a conexiones absolutas utilizando las variables de entorno de Vite (`import.meta.env.VITE_API_URL`), impidiendo errores de CORS y caídas de conexión.

---

## 📱 5. Encapsulamiento en Android (Sistemas Operativos)

La aplicación está diseñada para ser compilada en **Android Studio** mediante una envoltura nativa en un `WebView` de Android:

1. **Permisos del Dispositivo (`AndroidManifest.xml`):** Solicita permisos explícitos al sistema operativo Android para el uso de la tarjeta de red del dispositivo:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```
2. **Acceso Local y CORS:** Habilita el tráfico HTTP plano (`usesCleartextTraffic="true"`) para pruebas locales sin certificados SSL, y activa el uso de `domStorageEnabled` y `JavaScriptEnabled` para permitir el almacenamiento de tokens (JWT) en el dispositivo y la lectura de los ficheros compilados de React de forma local.

---

## 🐧 6. Administración del Servidor y Procesos (Ubuntu)

El despliegue en producción demuestra habilidades avanzadas de administración de sistemas Linux:

1. **Control de Demonios con PM2:** Los servidores backend no se ejecutan directamente en la shell interactiva, sino bajo el control del gestor de procesos **PM2** (Process Manager 2), asegurando el reinicio del servicio si se cae y la persistencia tras apagar/encender la máquina virtual.
   ```bash
   # Iniciar backend de producción inyectando el entorno
   pm2 start server.js --name login-back-prod -- --env-file=.env.prod
   ```
2. **Aislamiento de PostgreSQL:** El motor de base de datos corre de forma nativa en el puerto local `5432`. El aislamiento DEV/PROD se realiza creando dos bases de datos lógicas aisladas (`death_cloud_dev` y `death_cloud_prod`), las cuales corren concurrentemente en el mismo motor sin mezclarse.

---

## 🏆 Conclusión de Sprint 0
La aplicación **Deathcloud Login App** ha finalizado su fase estructural básica cumpliendo con todos los criterios de redes y sistemas operativos requeridos. La arquitectura nativa de base de datos e integración proxy reverso se encuentra documentada y lista para su defensa de Sprint.
