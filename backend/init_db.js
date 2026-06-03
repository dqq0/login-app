const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 8000
});

async function run() {
  console.log('🔌 Conectando a', process.env.DB_HOST, '/', process.env.DB_NAME);

  // ─── TABLAS PRINCIPALES ───────────────────────────────────────────────────
  const mainQueries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      clave_encriptada VARCHAR(255) NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'user'`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS baneado BOOLEAN DEFAULT false`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS motivo_ban VARCHAR(255)`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT 'none'`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio VARCHAR(255) DEFAULT NULL`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nickname VARCHAR(50)`,
    `UPDATE usuarios SET nickname = nombre_usuario WHERE nickname IS NULL`,
    `CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(100) NOT NULL,
      texto TEXT NOT NULL,
      hora VARCHAR(50) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS amigos (
      id SERIAL PRIMARY KEY,
      usuario_id_envia INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      usuario_id_recibe INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')),
      fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_respuesta TIMESTAMP DEFAULT NULL,
      CONSTRAINT unique_solicitud_amistad UNIQUE (usuario_id_envia, usuario_id_recibe),
      CONSTRAINT check_no_auto_amistad CHECK (usuario_id_envia <> usuario_id_recibe)
    )`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(100) NOT NULL,
      descripcion TEXT NOT NULL,
      categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('cuenta', 'bug', 'tienda', 'otro')),
      estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
      prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  console.log('\n📋 CREANDO TABLAS PRINCIPALES...');
  for (let q of mainQueries) {
    await pool.query(q);
    const label = q.trim().replace(/\s+/g, ' ').substring(0, 70);
    console.log('  ✅', label);
  }

  // ─── TABLAS POR JUEGO (esquemas en la misma DB) ──────────────────────────
  const games = [
    { id: 'deathcloud-runner',     schema: 'runner' },
    { id: 'deathcloud-toxic-skies', schema: 'skies' },
    { id: 'deathcloud-2d',          schema: '2d' }
  ];

  const defaultStats = {
    runner: [
      { name: 'ShadowFang',   score: '4532' },
      { name: 'LunaMist',     score: '4127' },
      { name: 'DarkReaper',   score: '3963' },
      { name: 'BloodWraith',  score: '3411' },
      { name: 'NightStalker', score: '3210' }
    ],
    skies: [
      { name: 'BioHazard',   score: '5110' },
      { name: 'ToxicoV',     score: '4820' },
      { name: 'ShadowFang',  score: '3810' }
    ],
    '2d': [
      { name: 'PixelMaster', score: '8990' },
      { name: 'RetroJoe',    score: '7540' },
      { name: 'LunaMist',    score: '6200' }
    ]
  };

  let fakeIdCounter = 5000;

  for (let game of games) {
    const s = game.schema;
    console.log(`\n🎮 ESQUEMA [${s}]...`);

    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${s}"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${s}".user_credits (
        usuario_id INT PRIMARY KEY,
        credits INT DEFAULT 2500
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${s}".user_skins (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        skin_id VARCHAR(100) NOT NULL,
        fecha_adquisicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${s}".user_stats (
        usuario_id INT PRIMARY KEY,
        score VARCHAR(50) DEFAULT '0',
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(`  ✅ user_credits, user_skins, user_stats OK`);

    // Poblar leaderboard con datos de demo si está vacío
    const check = await pool.query(`SELECT COUNT(*) FROM "${s}".user_stats`);
    if (parseInt(check.rows[0].count) === 0) {
      console.log(`  🌱 Sembrando datos de clasificación...`);
      for (let entry of defaultStats[s]) {
        const userRes = await pool.query(
          'SELECT id FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
          [entry.name]
        );
        let uid = userRes.rows.length > 0 ? userRes.rows[0].id : ++fakeIdCounter;

        if (userRes.rows.length === 0) {
          await pool.query(
            `INSERT INTO usuarios (id, nombre_usuario, nickname, email, clave_encriptada)
             VALUES ($1, $2, $2, $3, 'mock_leaderboard_hash')
             ON CONFLICT DO NOTHING`,
            [uid, entry.name, `${entry.name.toLowerCase()}@deathcloud.com`]
          );
        }
        await pool.query(
          `INSERT INTO "${s}".user_stats (usuario_id, score) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [uid, entry.score]
        );
        console.log(`    📊 ${entry.name} → ${entry.score} pts`);
      }
    } else {
      console.log(`  ℹ️  Stats ya poblados (${check.rows[0].count} registros). Saltando seed.`);
    }
  }

  // ─── VERIFICACIÓN FINAL ───────────────────────────────────────────────────
  console.log('\n📦 TABLAS CREADAS EN LA BASE DE DATOS:');
  const tables = await pool.query(`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname NOT IN ('pg_catalog','information_schema') 
    ORDER BY schemaname, tablename
  `);
  tables.rows.forEach(r => console.log(`  📄 ${r.schemaname}.${r.tablename}`));

  await pool.end();
  console.log('\n✅ INICIALIZACIÓN COMPLETADA');
}

run().catch(e => {
  console.error('❌ FATAL:', e.message);
  process.exit(1);
});
