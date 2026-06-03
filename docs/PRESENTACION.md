# 🎭 Guía Rápida de Exposición (PC de Presentación 💻 ➔ Servidor Ubuntu 🐧)
**Proyecto:** Deathcloud Login App  
**Materia:** Sistemas Operativos y Redes  

Esta es la receta simplificada de 3 minutos para configurar DBeaver, arrancar el Frontend en la PC nueva y realizar los dos tests estrella (DEV y PROD) frente a los profesores.

---

## 🔌 1. Configurar DBeaver en la PC Nueva
Para mostrar visualmente las tablas y los datos en vivo a los profesores:

1. Abre **DBeaver** en la PC de presentación.
2. Haz clic en el enchufe con el símbolo **+** (Nueva conexión).
3. Selecciona **PostgreSQL** y haz clic en Siguiente.
4. Rellena los datos de la pestaña **Main**:
   * **Host:** `<IP_DE_TU_SERVIDOR_UBUNTU>` (La IP de tu máquina de Ubuntu).
   * **Port:** `5432`
   * **Database:** `death_cloud_prod` (y crea otra conexión idéntica para `death_cloud_dev`).
   * **Username:** `diego`
   * **Password:** `admin123`
5. Haz clic en **Test Connection** (Probar Conexión). Si sale exitosa, dale a Finalizar.
6. **Cómo usarlo en la demo:** Expande `Schemas -> public -> Tables -> usuarios`, ve a la pestaña **Datos** (Data) y dale al botón de refrescar (icono naranja circular o `F5`) cada vez que quieras mostrar un registro nuevo.

---

## 💻 2. Iniciar el Frontend (React) en la PC Nueva
Para que la interfaz web de la PC de presentación le pida datos a tu Servidor Ubuntu remoto:

1. Abre la carpeta del frontend en tu editor/consola de la PC de presentación (`frontend/react-app`).
2. Edita el archivo `.env.development` y pon la IP del Servidor:
   * **Para probar DEV:**
     ```env
     VITE_API_URL=http://<IP_DE_TU_SERVIDOR_UBUNTU>:3000/api
     ```
   * **Para probar PROD:**
     ```env
     VITE_API_URL=http://<IP_DE_TU_SERVIDOR_UBUNTU>:4000/api
     ```
3. En la terminal del frontend, ejecuta:
   ```bash
   npm install
   npm run dev
   ```
4. Abre en el navegador: `http://localhost:5173`.

---

## 🧪 3. El Flujo de la Presentación (Demostración de 2 Minutos)

### 🛠️ TEST A: Entorno de Desarrollo (DEV)
* **Paso A.1:** En tu archivo `.env.development`, apunta al puerto `:3000/api` y arranca la interfaz.
* **Paso A.2:** Ve al navegador, haz clic en registrarse y crea un piloto (ej: `DevPilot`, `dev@test.com`, `cyberpunk2026`).
* **Paso A.3:** Inicia sesión con `DevPilot`, abre el chat y escribe: *"Transmisión DEV activa en la red"*.
* **Paso A.4 (DBeaver Impacto Visual):** Ve a DBeaver, abre la base de datos `death_cloud_dev`, abre la tabla `usuarios` y presiona **F5**.
  * **Resultado:** Los profesores verán aparecer a `DevPilot` con su contraseña encriptada con Bcrypt (`$2a$`). Abre la tabla `mensajes` y verán el mensaje del chat persistido.

---

### 🚀 TEST B: Entorno de Producción (PROD) - Demostración de Aislamiento
* **Paso B.1:** Edita el `.env.development` y cámbialo al puerto de producción `:4000/api` (o simplemente `/api` si usas el proxy de Nginx). Reinicia el frontend con `npm run dev`.
* **Paso B.2:** Intenta iniciar sesión con la cuenta de `DevPilot`.
  * **Resultado:** Te dará **"Credenciales inválidas"**. Explícale al profesor: *"Esto demuestra el aislamiento absoluto de datos. El usuario creado en desarrollo no existe en producción"* (Hito de Sistemas Operativos/Redes).
* **Paso B.3:** Regístrate en esta pantalla de producción con un piloto nuevo (ej: `ProdPilot`, `prod@test.com`, `cyberpunk2026`).
* **Paso B.4:** Inicia sesión y escribe en el chat: *"Comunicaciones seguras en Producción estables"*.
* **Paso B.5 (DBeaver):** En DBeaver, abre la base de datos `death_cloud_prod` y refresca la tabla `usuarios`.
  * **Resultado:** Verás aparecer únicamente a `ProdPilot`. Has demostrado aislamiento de base de datos e integridad multi-entorno en vivo.
