# 🎭 Guía de Exposición 100% Remota (Navegador, DBeaver y SSH)
**Proyecto:** Deathcloud Login App  
**Materia:** Sistemas Operativos y Redes  

En esta modalidad de presentación, **no ejecutas ningún servidor ni código en la PC nueva**. Todo el sistema (Frontend en React a través de Nginx, Backend en Node con PM2 y PostgreSQL) ya está corriendo de forma persistente en tu **Servidor Ubuntu Remoto**.

Solo usas la PC de la presentación para navegar, conectarte por terminal (SSH) para mostrar los logs y usar DBeaver de manera visual.

---

## 🔌 1. Configurar DBeaver en la PC Nueva
Para mostrar visualmente a los profesores cómo se guardan y aíslan los datos en el servidor:

1. Abre **DBeaver** en la PC de la presentación.
2. Haz clic en el botón de **Nueva conexión (+)** y selecciona **PostgreSQL**.
3. Rellena los datos de la pestaña **Main**:
   * **Host:** `192.168.50.24`
   * **Port:** `5432`
   * **Database:** `death_cloud_prod` (y haz otra conexión idéntica apuntando a `death_cloud_dev`).
   * **Username:** `diego`
   * **Password:** `admin123`
4. Haz clic en **Test Connection** (Probar Conexión) y luego en **Finalizar**.
5. Abre las tablas `usuarios` y `mensajes` de ambas bases de datos de fondo para tenerlas listas.

---

## 🖥️ 2. Ver el Servidor en Vivo desde la Terminal SSH
Para mostrar a los profesores cómo responde el sistema operativo del servidor en tiempo real:

1. Abre la terminal de la PC nueva (CMD o PowerShell) y conéctate al servidor:
   ```bash
   ssh icin@192.168.50.24
   ```
2. Ejecuta el comando de PM2 para ver en tiempo real el tráfico de red, registros, logins y mensajes en vivo:
   ```bash
   pm2 logs
   ```
   *(Deja esta terminal abierta a un lado de la pantalla para monitorear el flujo)*.

---

## 🧪 3. El Flujo de la Presentación (Demostración de 2 Minutos)

### 🛠️ TEST A: Entorno de Desarrollo (DEV) - Puerto 8080
* **Paso A.1:** Abre el navegador en la PC nueva e ingresa a la URL de desarrollo:
  ```text
  http://192.168.50.24:8080
  ```
* **Paso A.2:** Haz clic abajo en *"¿No tienes cuenta? Regístrate aquí"* y crea un piloto:
  * **Usuario:** `DevPilot` | **Email:** `dev@test.com` | **Contraseña:** `cyberpunk2026`
* **Paso A.3:** Inicia sesión con `DevPilot`, abre el chat en vivo y envía: *"Transmisión DEV activa en la red"*.
* **Paso A.4 (Verificación de Logs y BD):**
  * **En la terminal SSH:** Verás aparecer en vivo las líneas de conexión y transmisión del backend DEV en puerto 3000.
  * **En DBeaver:** Abre tu conexión de la base de datos `death_cloud_dev`, abre la tabla `usuarios` y presiona **F5**. Verás a `DevPilot` con su contraseña encriptada por Bcrypt (`$2a$`). En la tabla `mensajes` verás su transmisión.

---

### 🚀 TEST B: Entorno de Producción (PROD) - Puerto 80 Estándar
* **Paso B.1:** Abre otra pestaña en tu navegador e ingresa a producción (Puerto 80 estándar servido por Nginx):
  ```text
  http://192.168.50.24
  ```
* **Paso B.2 (Demostración de Aislamiento):** Intenta iniciar sesión en esta pestaña con la cuenta `dev@test.com`.
  * **Resultado:** Fallará con *"Credenciales inválidas"*.
  * **Explicación al jurado:** *"Esto demuestra el aislamiento a nivel de red y base de datos. Los usuarios del entorno de desarrollo no existen en la base de datos de producción `death_cloud_prod`"*.
* **Paso B.3:** Regístrate en esta pantalla de producción con un piloto nuevo:
  * **Usuario:** `ProdPilot` | **Email:** `prod@test.com` | **Contraseña:** `cyberpunk2026`
* **Paso B.4:** Inicia sesión y escribe en el chat: *"Comunicaciones en Producción estables"*.
* **Paso B.5 (Verificación de Logs y BD):**
  * **En la terminal SSH:** Verás los logs del puerto 4000 (Producción).
  * **En DBeaver:** Ve a `death_cloud_prod`, refresca la tabla `usuarios` y verás aparecer a `ProdPilot` (y comprobarás que `DevPilot` no existe allí).
