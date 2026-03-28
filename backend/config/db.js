const { Pool } = require('pg');
require('dotenv').config();

// Conexión a la base de datos usando variables de entorno
// Si no existe el archivo .env, usará por defecto la configuración local de Fedora
const pool = new Pool({
  user: process.env.DB_USER || 'diego',
  host: process.env.DB_HOST || '/var/run/postgresql',
  database: process.env.DB_NAME || 'app_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432
});

module.exports = pool;
