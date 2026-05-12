# 📡 Documentación de Endpoints (API) - Death Clouds

Este documento detalla las rutas de acceso al servidor para que el equipo de Frontend sepa cómo conectar el Login y el Registro.

## 🔐 Rutas de Autenticación (`/backend/routes/authRoutes.js`)

Todas estas rutas se ejecutan mediante el método **POST** y devuelven la respuesta del servidor según el éxito de la operación.

| Método | Endpoint | Acción | Parámetros sugeridos (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/login` | Inicia sesión del usuario | `{ "email", "password" }` |
| **POST** | `/register` | Crea una cuenta nueva | `{ "username", "email", "password" }` |

---

## ⚙️ Notas para Desarrolladores
- **Base URL:** Asegúrate de que tu `fetch` apunte a la dirección correcta del servidor (normalmente `http://localhost:3000`).
- **Middlewares:** El sistema está preparado para usar middlewares (ver carpeta `backend/middleware`) en caso de necesitar proteger rutas en el futuro.
