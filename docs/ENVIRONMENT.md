# Guía de Entornos (Dev/Prod)

Este documento explica cómo levantar y gestionar los entornos del proyecto.

## Requisitos
- Docker y Docker Compose instalados.

## Entorno de Desarrollo
Para levantar el proyecto en modo desarrollo (con hot-reload y pgAdmin):

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **pgAdmin**: http://localhost:8080 (Login: admin@admin.com / admin)

## Entorno de Producción
Para simular el entorno de producción (builds optimizados):

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Comandos Útiles
- Ver logs: `docker-compose logs -f`
- Detener todo: `docker-compose down`
- Limpiar volúmenes (borra la BD): `docker-compose down -v`
