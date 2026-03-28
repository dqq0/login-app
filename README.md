# Deathcloud Login App

Este proyecto contiene un portal de login dividido estructuradamente en Capas (Frontend Vanilla JS y Backend MVC con Node/Express).

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (v16+)
- Base de datos PostgreSQL (local o externa)

## 📁 Estructura del Proyecto

- `frontend/`: Archivos del cliente (HTML, CSS, Componentes React en JSX y PWA config).
- `backend/`: Código del servidor NodeJS estructurado en capas (Config, Controllers, Routes).

## 🛢️ Configuración de la Base de Datos (Windows / Linux / Mac)

Para que el servidor se pueda conectar a la base de datos sin errores de credenciales (especialmente si no usas Fedora/Linux):

1. Ve a la carpeta `backend/` y crea una copia del archivo `.env.example`.
2. Renombra la copia a `.env`.
3. Abre el archivo `.env` configurando los datos según tu entorno:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=app_db
   DB_PASSWORD=tu_contrasena_aqui
   DB_PORT=5432
   ```

*(Nota: Si usas el entorno original de desarrollo en Fedora, funcionará por defecto sin necesidad de archivo `.env` en la dirección local `/var/run/postgresql` con el usuario `diego`)*.

---

## 💻 Instalación y Ejecución

### 1. Iniciar el Servidor Backend

Abre una terminal y ejecuta:

```bash
cd backend
npm install
npm run start
```
*(Si no tienes un script `start` en el package.json, simplemente ejecuta `node server.js`).*

Verás un mensaje: `✅ Servidor corriendo en http://localhost:3000`

### 2. Iniciar el Frontend

Al estar escrito como un conjunto de archivos independientes con Vanilla JS y babel Standalone, el Frontend se puede servir de varias formas:

**Opción A (Recomendada con VSCode):**
Usa la extensión **Live Server** dando click derecho en el archivo `frontend/index.html` > *Open with Live Server*.

**Opción B (Doble Clic):**
Si el navegador lo permite, simplemente haz doble click en `frontend/index.html` (Nota: algunas características como Service Workers pueden necesitar obligatoriamente un protocolo `http://`).

## ✍🏻 Autores
- Proyecto subido para revisión.
