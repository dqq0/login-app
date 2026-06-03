# Guía de Entornos (Dev/Prod) - Setup Nativo

Este documento explica cómo gestionar los entornos de Desarrollo y Producción utilizando Node.js, Nginx y PostgreSQL de forma nativa (sin contenedores).

## Arquitectura de Red

La aplicación se comunica a través de puertos específicos para evitar conflictos:

| Entorno | Componente | Puerto | URL Local |
| :--- | :--- | :--- | :--- |
| **Producción** | Frontend | 80 | `http://<IP_SERVIDOR>` |
| **Producción** | Backend | 4000 | `http://<IP_SERVIDOR>:4000` |
| **Desarrollo** | Frontend | 8080 | `http://<IP_SERVIDOR>:8080` |
| **Desarrollo** | Backend | 3000 | `http://<IP_SERVIDOR>:3000` |

## Gestión con PM2 (Ubuntu Server)

Para mantener los procesos activos 24/7 en el servidor:

```bash
# Iniciar Producción
cd backend
node --env-file=.env.prod server.js # Prueba manual
pm2 start server.js --name login-back-prod -- --env-file=.env.prod

# Iniciar Desarrollo
pm2 start server.js --name login-back-dev -- --env-file=.env.dev
```

## Configuración de Base de Datos

Se requieren dos bases de datos en el mismo servidor PostgreSQL:

1.  `death_cloud_prod`: Usuarios reales y datos críticos.
2.  `death_cloud_dev`: Pruebas y experimentos.

### Bypass de Contraseña (Solo para Demo)
Si olvidaste la contraseña local, puedes editar el archivo `pg_hba.conf` y cambiar el método de autenticación de `scram-sha-256` a `trust` para las conexiones `127.0.0.1/32`.

## Variables de Entorno (.env)

Cada entorno lee su propio archivo:
- `backend/.env.dev`
- `backend/.env.prod`

Asegúrate de que `DB_NAME` y `PORT` coincidan con la tabla de arriba.
