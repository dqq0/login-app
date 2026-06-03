/**
 * seed_demo.js — Poblar la base de datos con datos de demo completos
 * Ejecutar: node seed_demo.js [prod]
 * Ejemplo DEV:  node seed_demo.js
 * Ejemplo PROD: node seed_demo.js prod
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const targetDb = process.argv[2] === 'prod' ? 'death_cloud_prod' : 'death_cloud_dev';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: targetDb,
  connectionTimeoutMillis: 8000
});

async function seed() {
  console.log(`\n🌱 SEMBRANDO DATOS DEMO EN [${targetDb}]\n`);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. USUARIOS DE DEMO (con contraseñas hasheadas reales)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('👤 Insertando usuarios de demo...');
  const users = [
    { nombre: 'Sebastian', nickname: 'Sebastian', email: 'seba@test.com',            pass: 'seba123',  rol: 'admin' },
    { nombre: 'diego',     nickname: 'Diego',     email: 'diego@deathcloud.com',     pass: 'admin123', rol: 'admin' },
    { nombre: 'ShadowFang',nickname: 'ShadowFang',email: 'shadowfang@deathcloud.com',pass: 'demo123',  rol: 'user'  },
    { nombre: 'LunaMist',  nickname: 'LunaMist',  email: 'lunamist@deathcloud.com',  pass: 'demo123',  rol: 'user'  },
    { nombre: 'BioHazard', nickname: 'BioHazard', email: 'biohazard@deathcloud.com', pass: 'demo123',  rol: 'user'  },
    { nombre: 'PixelMaster',nickname:'PixelMaster',email:'pixelmaster@deathcloud.com',pass: 'demo123',  rol: 'user'  },
  ];

  const insertedUsers = {};
  for (let u of users) {
    const hash = await bcrypt.hash(u.pass, 10);
    const res = await pool.query(
      `INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada, rol, avatar_url, bio)
       VALUES ($1, $2, $3, $4, $5, 'none', $6)
       ON CONFLICT (email) DO UPDATE SET nickname = EXCLUDED.nickname, rol = EXCLUDED.rol
       RETURNING id, nombre_usuario`,
      [u.nombre, u.nickname, u.email, hash, u.rol,
       u.rol === 'admin' ? 'Piloto administrador de la red DeathCloud.' : 'Piloto de la red DeathCloud.']
    );
    insertedUsers[u.nombre] = res.rows[0].id;
    console.log(`  ✅ ${u.nombre} (id: ${res.rows[0].id}) — ${u.email} / ${u.pass}`);
  }

  const sebId  = insertedUsers['Sebastian'];
  const diegoId = insertedUsers['diego'];
  const shadowId = insertedUsers['ShadowFang'];
  const lunaId   = insertedUsers['LunaMist'];
  const bioId    = insertedUsers['BioHazard'];
  const pixelId  = insertedUsers['PixelMaster'];

  // ─────────────────────────────────────────────────────────────────────────
  // 2. MENSAJES DE CHAT (historial inicial)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n💬 Insertando mensajes de chat...');
  const mensajes = [
    { usuario: 'Sistema',    texto: '🟢 Red DeathCloud operativa. Bienvenidos, pilotos.',      hora: '08:00:00' },
    { usuario: 'ShadowFang', texto: '¡Alguien para una partida de Runner?',                    hora: '08:05:22' },
    { usuario: 'LunaMist',   texto: 'Voy, espérenme en la sala 3.',                            hora: '08:06:01' },
    { usuario: 'BioHazard',  texto: 'Toxic Skies tiene mejor loot esta temporada.',            hora: '08:07:44' },
    { usuario: 'diego',      texto: 'Recordad que el torneo empieza el viernes.',              hora: '08:10:00' },
    { usuario: 'Sebastian',  texto: '¡Confirmado, me apunto al torneo!',                      hora: '08:10:45' },
    { usuario: 'ShadowFang', texto: 'La skin del Tiburón Mecánico es increíble.',             hora: '08:15:30' },
    { usuario: 'PixelMaster',texto: '¿Alguien probó el modo 2D retro? Adictivo.',             hora: '08:20:11' },
    { usuario: 'LunaMist',   texto: 'Sí, me encanta. Los controles son perfectos.',            hora: '08:21:00' },
    { usuario: 'Sistema',    texto: '⚡ Actualización v1.2.0 disponible. Nuevas armas.',       hora: '09:00:00' },
  ];

  for (let m of mensajes) {
    await pool.query(
      'INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)',
      [m.usuario, m.texto, m.hora]
    );
  }
  console.log(`  ✅ ${mensajes.length} mensajes insertados`);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. AMIGOS Y SOLICITUDES
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n👥 Insertando relaciones de amistad...');
  const friendships = [
    { envia: sebId,   recibe: diegoId,  estado: 'aceptado'  }, // Sebastian ↔ Diego (amigos)
    { envia: sebId,   recibe: shadowId, estado: 'aceptado'  }, // Sebastian ↔ ShadowFang (amigos)
    { envia: lunaId,  recibe: sebId,    estado: 'pendiente' }, // LunaMist → Sebastian (solicitud pendiente)
    { envia: bioId,   recibe: diegoId,  estado: 'aceptado'  }, // BioHazard ↔ Diego (amigos)
    { envia: pixelId, recibe: sebId,    estado: 'pendiente' }, // PixelMaster → Sebastian (solicitud pendiente)
  ];

  for (let f of friendships) {
    await pool.query(
      `INSERT INTO amigos (usuario_id_envia, usuario_id_recibe, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT unique_solicitud_amistad DO NOTHING`,
      [f.envia, f.recibe, f.estado]
    );
    console.log(`  ✅ ${f.envia} → ${f.recibe} [${f.estado}]`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. TICKETS DE SOPORTE
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🎫 Insertando tickets de soporte...');
  const tickets = [
    { uid: sebId,   titulo: 'No puedo cambiar mi avatar',       desc: 'Al intentar actualizar la URL del avatar, el sistema devuelve error 500.',     cat: 'cuenta',  est: 'abierto',     pri: 'media'  },
    { uid: shadowId,titulo: 'Bug en Runner - caída de FPS',     desc: 'En la zona 3 del mapa, los FPS caen a menos de 10 de forma consistente.',      cat: 'bug',     est: 'en_progreso', pri: 'alta'   },
    { uid: lunaId,  titulo: 'Skin no aparece en inventario',    desc: 'Compré la skin del Tiburón Mecánico y me descontaron los E-Points pero no aparece en mi inventario.', cat: 'tienda', est: 'abierto', pri: 'alta' },
    { uid: diegoId, titulo: 'Solicitud: modo espectador',       desc: 'Sería útil poder ver las partidas de otros jugadores en tiempo real.',          cat: 'otro',    est: 'abierto',     pri: 'baja'   },
    { uid: bioId,   titulo: 'Error al iniciar sesión con VPN',  desc: 'Desde fuera de la red universitaria no puedo conectarme al servidor.',          cat: 'cuenta',  est: 'resuelto',    pri: 'critica'},
  ];

  for (let t of tickets) {
    await pool.query(
      `INSERT INTO tickets (usuario_id, titulo, descripcion, categoria, estado, prioridad)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [t.uid, t.titulo, t.desc, t.cat, t.est, t.pri]
    );
    console.log(`  ✅ [${t.cat}/${t.pri}] "${t.titulo}"`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. E-POINTS (créditos por juego para usuarios principales)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🪙 Insertando E-Points por juego...');
  const creditData = [
    // [schema, usuario_id, credits]
    ['runner', sebId,    1700], // Sebastian compró algo
    ['runner', diegoId, 2500],
    ['runner', shadowId,3200], // ShadowFang tiene más EP
    ['runner', lunaId,  2100],
    ['skies',  sebId,   2500],
    ['skies',  diegoId, 1500],
    ['skies',  bioId,   4000],
    ['2d',     sebId,   2050],
    ['2d',     pixelId, 500],  // PixelMaster casi sin EP
  ];

  for (let [schema, uid, credits] of creditData) {
    await pool.query(
      `INSERT INTO "${schema}".user_credits (usuario_id, credits)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET credits = EXCLUDED.credits`,
      [uid, credits]
    );
    console.log(`  ✅ [${schema}] usuario ${uid} → ${credits} EP`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. SKINS ADQUIRIDAS (inventario)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🎨 Insertando skins en inventario...');
  const skinData = [
    // [schema, usuario_id, skin_id]
    ['runner', sebId,    'mount-01'],      // Sebastian tiene el Tiburón Mecánico
    ['runner', diegoId,  'mount-01'],      // Diego también
    ['runner', shadowId, 'mount-01'],      // ShadowFang tiene la skin épica
    ['skies',  bioId,    'toxic-skin-01'], // BioHazard tiene el traje tóxico
    ['2d',     pixelId,  'retro-skin-01'], // PixelMaster tiene el aspecto retro
    ['2d',     sebId,    'retro-skin-01'], // Sebastian también tiene la retro
  ];

  for (let [schema, uid, skinId] of skinData) {
    await pool.query(
      `INSERT INTO "${schema}".user_skins (usuario_id, skin_id)
       VALUES ($1, $2)`,
      [uid, skinId]
    );
    console.log(`  ✅ [${schema}] usuario ${uid} → skin "${skinId}"`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. STATS (actualizar con los usuarios reales insertados)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🏆 Actualizando stats con usuarios reales...');
  const statsData = [
    ['runner', sebId,    '2890'],
    ['runner', diegoId,  '1540'],
    ['runner', shadowId, '4532'],
    ['runner', lunaId,   '4127'],
    ['skies',  sebId,    '3200'],
    ['skies',  bioId,    '5110'],
    ['2d',     sebId,    '6100'],
    ['2d',     pixelId,  '8990'],
  ];

  for (let [schema, uid, score] of statsData) {
    await pool.query(
      `INSERT INTO "${schema}".user_stats (usuario_id, score)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET score = EXCLUDED.score`,
      [uid, score]
    );
    console.log(`  ✅ [${schema}] usuario ${uid} → ${score} pts`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ SEED COMPLETO EN [${targetDb}]`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const counts = await Promise.all([
    pool.query('SELECT COUNT(*) FROM usuarios'),
    pool.query('SELECT COUNT(*) FROM mensajes'),
    pool.query('SELECT COUNT(*) FROM amigos'),
    pool.query('SELECT COUNT(*) FROM tickets'),
  ]);
  console.log(`  usuarios:  ${counts[0].rows[0].count}`);
  console.log(`  mensajes:  ${counts[1].rows[0].count}`);
  console.log(`  amigos:    ${counts[2].rows[0].count}`);
  console.log(`  tickets:   ${counts[3].rows[0].count}`);

  await pool.end();
}

seed().catch(e => { console.error('❌ ERROR:', e.message); process.exit(1); });
