# 🧪 Guía Oficial de Testeo Paso a Paso — Deathcloud Login App
**Materia:** Sistemas Operativos y Redes  
**Proyecto:** Deathcloud Login App  
**Fecha:** Mayo 2026  
**Estado:** Listo para Evaluación  

Esta guía contiene el procedimiento paso a paso para desplegar, iniciar y verificar todas las funcionalidades del sistema a nivel local (Desarrollo), producción (Nginx/PM2) y en entornos móviles (Android WebView).

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina local:
1. **Node.js** (versión 18 o superior).
2. **PostgreSQL** corriendo localmente en el puerto `5432`.
3. Un navegador web moderno (Chrome, Edge, Firefox).

---

## 🗄️ Paso 1: Configuración de la Base de Datos (PostgreSQL)

El backend de Deathcloud cuenta con un sistema de **sincronización automática** (`initDB` en `server.js`). Esto significa que **no necesitas crear las tablas manualmente**; el backend las creará por ti al iniciarse, siempre y cuando la base de datos ya exista en PostgreSQL.

### A. Crear la Base de Datos
Abre tu consola de PostgreSQL (o PGAdmin / DBeaver) y ejecuta el comando de creación:
```sql
CREATE DATABASE app_db;
```
*(Si estás probando los entornos de desarrollo o producción aislados, crea también `death_cloud_dev` o `death_cloud_prod`).*

### B. Verificar Variables de Entorno del Backend
Asegúrate de que el archivo `backend/.env` tenga las credenciales correctas de tu base de datos:
```env
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_NAME=app_db
DB_PASSWORD=tu_contraseña
DB_PORT=5432
JWT_SECRET=deathcloud-secret-key-2026
```

---

## 🟢 Paso 2: Instalación e Inicio del Backend (Servicios)

1. Abre una terminal y navega hasta la carpeta del backend:
   ```powershell
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```powershell
   npm install
   ```
3. Inicia el servidor en modo desarrollo (se reiniciará automáticamente al hacer cambios):
   ```powershell
   npm run dev
   ```
4. **Verificación visual del Backend:**
   * Abre tu navegador y ve a `http://localhost:3000/`.
   * Deberías ver una pantalla negra de diseño cyberpunk con el mensaje: **"🚀 SERVIDOR DEATHCLOUD ACTIVO. Socket.io: ONLINE"**.
   * Revisa la terminal del backend. Debería mostrar:
     ```text
     📦 Base de datos sincronizada
     -------------------------------------------
     🚀 DEATHCLOUD BACKEND [DEVELOPMENT]
     📡 PUERTO: 3000
     📦 DB: app_db
     -------------------------------------------
     ```

### 💡 (Opcional) Creación de un Usuario por Línea de Comandos
Si quieres omitir el formulario web para crear un usuario inicial de prueba, puedes ejecutar el script CLI que corregimos:
```powershell
node crear_usuario.js
```
Esto creará directamente en la base de datos al piloto con el correo `seba@test.com` y contraseña `seba123`.

---

## 💻 Paso 3: Instalación e Inicio del Frontend (Interfaz Web)

1. Abre **otra terminal diferente** (deja la del backend corriendo) y navega al frontend:
   ```powershell
   cd frontend/react-app
   ```
2. Instala las dependencias del frontend:
   ```powershell
   npm install
   ```
3. Verifica que el archivo `.env.development` apunte correctamente al backend local:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Arranca el servidor de desarrollo de Vite:
   ```powershell
   npm run dev
   ```
5. Abre la URL que te muestre en la consola (normalmente `http://localhost:5173`).
6. Deberías ver la impresionante interfaz Cyberpunk de acceso a la red de **DEATHCLOUD**.

---

## 🧪 Paso 4: Pruebas Funcionales (Paso a Paso del Flujo de Trabajo)

Realiza las siguientes pruebas manuales secuenciales para validar el software al 100%:

### 1️⃣ Registro de un Nuevo Piloto (POST /api/register)
* En la pantalla de login, haz clic abajo en **"¿No tienes cuenta? Regístrate aquí"**.
* El título cambiará a "Registro de Piloto". Rellena los campos:
  * **Nombre de Usuario:** `ShadowPilot`
  * **Correo Electrónico:** `shadow@deathcloud.com`
  * **Contraseña:** `cyberpunk2026`
* Haz clic en **"Crear Cuenta"**.
* **Resultado esperado:** Aparecerá un mensaje en verde con el texto: **"Registro exitoso. ¡Ahora puedes iniciar sesión!"** y la pantalla conmutará automáticamente al formulario de Login.
* En tu terminal de Backend verás el log interno de la transacción.

### 2️⃣ Inicio de Sesión y Generación de Token JWT (POST /api/login)
* Introduce las credenciales que acabas de registrar:
  * **Email:** `shadow@deathcloud.com`
  * **Contraseña:** `cyberpunk2026`
* Haz clic en el botón brillante **"Sincronizar"**.
* **Resultado esperado:**
  * Entrarás al panel principal (Dashboard) del juego/aplicación.
  * El Header de la aplicación mostrará el nombre del piloto `ShadowPilot` y un indicador de red **"ONLINE"**.
  * **Comprobación técnica profunda (JWT):** Abre la consola de desarrollo del navegador (`F12`), ve a la pestaña **Application (Aplicación)** -> **Local Storage** -> `http://localhost:5173`. Verás dos llaves almacenadas:
    * `username`: `ShadowPilot`
    * `jwt_token`: Un token encriptado largo (JWT) devuelto por el backend.

### 3️⃣ Comunicación en Tiempo Real en el Chat en Vivo (WebSockets)
Esta es la prueba reina para demostrar el diseño de red bidireccional asíncrona:
* **Paso A:** En tu navegador actual, abre una pestaña en **Modo Incógnito** (o usa otro navegador como Edge) y entra en `http://localhost:5173`.
* **Paso B:** En esa pestaña de incógnito, regístrate como un segundo usuario (ej: `GhostPilot`, `ghost@deathcloud.com`, `cyberpunk2026`) e inicia sesión.
* **Paso C:** Organiza las dos ventanas del navegador lado a lado en tu pantalla para ver ambas simultáneamente.
* **Paso D:** En la ventana de `ShadowPilot`, haz clic en el botón de chat en el Header para abrir el panel **"Chat en Vivo"** lateral.
* **Paso E:** Haz lo mismo en la ventana de `GhostPilot`.
* **Paso F:** Escribe una transmisión desde la ventana de `ShadowPilot` (ej: *"¡Iniciando secuencia de abordaje!"*) y presiona Enter o el botón de enviar.
* **Resultados esperados:**
  * El mensaje aparecerá instantáneamente en el chat de **ambas pantallas** en milisegundos sin que ninguna página tenga que recargarse.
  * Los mensajes propios se alinean a la derecha en color cian neón, y los de otros usuarios se alinean a la izquierda en color rosa.
  * En la terminal del backend se imprimirán los logs en tiempo real:
    ```text
    🟢 Nuevo Piloto detectado en la red
    ✉️ Transmisión de [ShadowPilot]: ¡Iniciando secuencia de abordaje!
    ```

### 4️⃣ Persistencia de Datos e Historial de Mensajes
* Cierra ambas pestañas del chat.
* Ve a la consola del backend y apaga el servidor presionando `Ctrl + C`.
* Vuelve a encender el backend con `npm run dev`. (Esto demuestra que la memoria volátil del servidor se limpia).
* Regresa al navegador en cualquiera de tus pestañas y recarga la página.
* Abre el panel de **"Chat en Vivo"**.
* **Resultado esperado:** Los mensajes enviados anteriormente se vuelven a cargar y se muestran perfectamente ordenados. Esto verifica que el backend consultó correctamente a PostgreSQL mediante `SELECT ... FROM mensajes ORDER BY id ASC LIMIT 100` y transmitió el historial completo en el evento de conexión de Socket.io.

### 5️⃣ Verificación Física en la Base de Datos (PostgreSQL)
Para demostrar la persistencia física real y que las contraseñas no se guardan en texto plano (un punto clave en seguridad informática):

* **Paso A: Acceder a la Consola de PostgreSQL**
  Abre una terminal de comandos en Windows (PowerShell o CMD) y escribe el siguiente comando para conectarte a la base de datos `app_db` con tu usuario de Postgres (por defecto `diego` u otro que tengas configurado):
  ```powershell
  psql -U diego -d app_db
  ```
  *(Si tu usuario es `postgres`, usa `psql -U postgres -d app_db`. Si configuraste contraseña, la consola te solicitará que la escribas).*

* **Paso B: Consultar los Pilotos Registrados**
  Una vez conectado a la consola de Postgres (verás el cursor `app_db=#`), ejecuta la siguiente consulta SQL:
  ```sql
  SELECT id, nombre_usuario, email, clave_encriptada FROM usuarios;
  ```
  * **Lo que verás en la base de datos:**
    ```text
     id | nombre_usuario |         email         |                        clave_encriptada
    ----+----------------+-----------------------+-----------------------------------------------------------------
      1 | ShadowPilot    | shadow@deathcloud.com | $2a$10$7xY6vVjQv8D99XoD43GzNeQYdC08XW2Y1U3tW4v5w6x7y8z9a1b2c...
    ```
  * **Demostración de Seguridad (Bcrypt):** Fíjate en la columna `clave_encriptada`. La contraseña `cyberpunk2026` ha sido hasheada criptográficamente usando **Bcrypt** (el hash empieza con `$2a$`). Esto demuestra que el sistema es extremadamente seguro y stateless, ya que incluso si alguien vulnera la base de datos, nunca podrá conocer las contraseñas reales.

* **Paso C: Consultar las Transmisiones del Chat**
  Ejecuta la siguiente consulta para verificar que los mensajes del chat se almacenan en tiempo real:
  ```sql
  SELECT * FROM mensajes;
  ```
  * **Lo que verás en la base de datos:**
    ```text
     id |   usuario   |                 texto                 |   hora
    ----+-------------+---------------------------------------+----------
      1 | ShadowPilot | ¡Abriendo canal seguro de transmisión!| 19:15:02
    ```

* **Paso D: Salir de la Consola**
  Para volver a tu terminal normal, escribe:
  ```text
  \q
  ```

---


## 🛡️ Paso 5: Pruebas de Entornos Aislados en Local (DEV / PROD)

Si quieres verificar el aislamiento de entornos en local antes de ir al servidor:

1. **Entorno DEV (Puerto 3000):**
   * Corre el backend usando `.env.dev`:
     ```powershell
     node --env-file=.env.dev server.js
     ```
   * Verás que se conecta a la base de datos `death_cloud_dev` en el puerto `3000`.
2. **Entorno PROD (Puerto 4000):**
   * Corre el backend usando `.env.prod`:
     ```powershell
     node --env-file=.env.prod server.js
     ```
   * Verás que se conecta a la base de datos `death_cloud_prod` en el puerto `4000`.
3. **Validación:** Registra un usuario en DEV. Intenta iniciar sesión con ese mismo usuario en PROD; el sistema denegará el acceso ya que las bases de datos lógicas están 100% aisladas.

---

## 🐧 Paso 6: Pruebas y Verificación Directa en el Servidor Ubuntu Remoto

Para realizar las pruebas finales directamente sobre tu infraestructura en producción, sigue estos pasos:

### 1️⃣ Conexión vía SSH al Servidor
Abre tu consola local (PowerShell o CMD) y conéctate al servidor:
```bash
ssh tu_usuario@<IP_DEL_SERVIDOR>
```
*(Ingresa tu contraseña del servidor cuando la solicite).*

### 2️⃣ Controlar y Monitorear Procesos con PM2
1. Dirígete a la ruta del backend en tu servidor:
   ```bash
   cd /ruta/de/tu/proyecto/login-app/backend
   ```
2. Revisa qué servicios están corriendo:
   ```bash
   pm2 status
   ```
3. Si necesitas encender o reiniciar los servidores aislados de desarrollo o producción:
   * **Iniciar Entorno DEV (Puerto 3000):**
     ```bash
     pm2 start server.js --name login-back-dev -- --env-file=.env.dev
     ```
   * **Iniciar Entorno PROD (Puerto 4000):**
     ```bash
     pm2 start server.js --name login-back-prod -- --env-file=.env.prod
     ```
4. Guarda la configuración para asegurar la persistencia tras un reinicio de la máquina:
   ```bash
   pm2 save
   ```

### 3️⃣ Probar en el Navegador Apuntando al Servidor
Abre el navegador en tu máquina local e introduce la IP de tu servidor:
* **Entorno PROD:** `http://<IP_DEL_SERVIDOR>` (Acceso directo por puerto 80 gracias a Nginx).
* **Entorno DEV:** `http://<IP_DEL_SERVIDOR>:8080` (Puerto asignado para pruebas de desarrollo).

1. Registra un usuario (ej: `ServerPilot`, `server@deathcloud.com`, `cyberpunk2026`).
2. Inicia sesión y envía un mensaje por el chat.

### 4️⃣ Conectar e Inspeccionar la BD de PostgreSQL en el Servidor
En tu sesión SSH de Ubuntu, conéctate al motor de base de datos para corroborar la transacción:

1. Conéctate a PostgreSQL seleccionando el entorno que desees revisar:
   * **Para Entorno Desarrollo:**
     ```bash
     psql -U diego -d death_cloud_dev -W
     ```
   * **Para Entorno Producción:**
     ```bash
     psql -U diego -d death_cloud_prod -W
     ```
   *(La contraseña establecida para tu base de datos PostgreSQL en el servidor es `admin123`. Si tienes problemas de permisos, puedes entrar como superusuario del sistema con `sudo -u postgres psql` y cambiarte de base con `\c death_cloud_prod`).*

2. **Verificar el Piloto Creado:**
   Ejecuta:
   ```sql
   SELECT id, nombre_usuario, email, clave_encriptada FROM usuarios;
   ```
   Comprobarás que se listará a `ServerPilot` con la contraseña hasheada.

3. **Verificar los Mensajes de Chat:**
   Ejecuta:
   ```sql
   SELECT * FROM mensajes;
   ```

4. Desconéctate del motor PostgreSQL:
   ```text
   \q
   ```

---

## 📱 Paso 7: Pruebas en Android Studio (WebView)

Para compilar y testear la visualización móvil en tu emulador de Android:

1. **Compilar el Frontend React:**
   * En `frontend/react-app`, genera los archivos estáticos de producción:
     ```powershell
     npm run build
     ```
   * Esto generará una carpeta `dist/` con el HTML/CSS/JS ultra compactados.
2. **Importar estáticos en Android Studio:**
   * Copia los archivos dentro de `dist/` y pégalos en la carpeta `assets/` de tu proyecto de Android Studio (`app/src/main/assets/`).
3. **Conexión Automática Inteligente:**
   * Gracias al sensor de protocolo desarrollado en `LiveChatPanel.jsx` y `Login.jsx`, el WebView sabrá que corre desde un protocolo local `file://`.
   * Automáticamente conmutará a la URL absoluta configurada en la variable `VITE_API_URL` de tu archivo `.env.production` (ej. `http://<IP_DE_TU_SERVIDOR>:4000/api` o `http://10.0.2.2:3000/api` para el emulador local).
   * **Resultado esperado:** La aplicación en Android cargará con la misma fluidez neón, registrará pilotos, iniciará sesión e interactuará con el chat en vivo en tiempo real directamente con tu backend remoto o local.

---

## 🕹️ Paso 8: Pruebas de Aislamiento de Bases de Datos y Refinamientos de UI (Nuevos Cambios)

Sigue estos pasos para probar y demostrar las últimas incorporaciones:

### 1️⃣ Verificación del Modal de E-Points Adaptativo
1. Inicia sesión en el launcher.
2. Haz clic en el botón **"+"** al lado del widget de E-Points en el Header, o abre la búsqueda de red (`FiSearch`) e ingresa `"e-points"` para abrir la ventana de compra.
3. **Comprobar responsividad:** Ajusta la ventana del navegador o utiliza el inspector de elementos en modo móvil/tablet. Los paquetes de compra ahora se ordenarán verticalmente como filas horizontales elegantes, con su precio a la derecha y bono a la izquierda, adaptándose perfectamente a cualquier resolución sin cortes de pantalla.

### 2️⃣ Verificación del Título Dividido del Home Page
1. En el Dashboard, comprueba que el título de cabecera se muestre en dos bloques alineados verticalmente:
   * Primera línea: `DEATH CLOUD` en color blanco con efecto neón de fondo.
   * Segunda línea: El nombre de la versión actual (`RUNNER`, `TOXIC SKIES` o `2D`) centrado, en un formato más pequeño, espaciado y con el color neón activo.
2. Despliega el menú del logo en el extremo izquierdo y selecciona **Skies** o **2D**. Comprueba que la segunda línea del título cambie inmediatamente a `TOXIC SKIES` o `2D` aplicando el color temático de la versión seleccionada.

### 3️⃣ Verificación de Aislamiento de Datos por Juego (Estilo Riot Games)
1. **Puntajes y Clasificación Independientes:**
   * Abre la pestaña **Ranking**. Selecciona **Runner** y observa a los líderes (`ShadowFang`, `LunaMist`, etc.).
   * Selecciona **Toxic Skies** en el menú superior izquierdo. Vuelve a **Ranking** y comprueba que la clasificación cambie mostrando únicamente a los pilotos de esa base de datos/esquema (`BioHazard`, `ToxicoV`, etc.).
2. **Créditos y Skins Aislados:**
   * Estando en **Runner**, ve a la **Tienda** y adquiere la *Montura Tiburón Mecánico* por 800 EP.
   * Comprueba que tu saldo de E-Points se reduce de 2,500 EP a 1,700 EP y que el botón del artículo cambia a **"Adquirido"** (y queda deshabilitado).
   * Cambia a **Toxic Skies** en el selector.
   * Ve a la **Tienda** y comprueba que en esta versión tu saldo de E-Points se mantiene intacto (2,500 EP) y que no posees la skin del Tiburón (es decir, el balance y las compras están completamente aisladas en la base de datos de Skies).
3. **Persistencia en Base de Datos (o Fallback en Memoria):**
   * El sistema está configurado para almacenar estas compras en bases de datos separadas (ej. `death_cloud_runner`) o esquemas separados (`runner.*`, `skies.*`, `2d.*`).
   * Si la VPN o el servidor Postgres de la universidad están fuera de línea, el backend lo detectará e iniciará automáticamente en **Modo Local Simulador en Memoria**. Podrás realizar compras, ganar puntos y cambiar de juego, y toda la persistencia se mantendrá aislada en la memoria volátil del servidor para fines de prueba interactiva sin congelar la aplicación.
