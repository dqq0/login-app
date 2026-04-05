# Historial de Cambios (Changelog)

## Versión 1: Login
- **Implementación del Login**: Se creó la interfaz de usuario para el inicio de sesión.
- **Estilos y CSS**: Se integró el diseño con CSS ("loginconcss").
- **Conexión API (Básica)**: Se implementó la captura de datos (usuario/contraseña) y el envío a la API (Endpoing `/api/login`) para validar al usuario y obtener un token JWT.

## Versión 2: Refactorización (Frontend y Backend)
- **Estructura en Capas**: Se dividió el proyecto para cumplir con los requerimientos académicos, separando claramente el código en directorios `frontend` y `backend`.
- **Backend**: Se implementó una arquitectura MVC (Model-View-Controller) con Node.js y Express, con separación de roles en rutas, controladores y configuración (base de datos o variables de entorno).
- **Frontend**: Se consolidaron los archivos de React, el HTML y el CSS en su propia carpeta para evitar que el código estuviera disperso (desparramado).
- **Preparación de Base de Datos**: Se configuraron las conexiones (PostgreSQL/MySQL) de manera estructurada usando variables de entorno `.env`.
