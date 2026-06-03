const { pool, getGamePool } = require('../config/db');

// Helper para armar nombre de tabla según el esquema (public o prefijo de juego)
const getTableName = (schema, table) => {
  return schema === 'public' ? table : `${schema}.${table}`;
};

// Obtener E-Points del usuario en un juego específico
exports.getCredits = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const table = getTableName(schema, 'user_credits');

    // Consultar saldo actual
    let result = await gamePool.query(
      `SELECT credits FROM ${table} WHERE usuario_id = $1`,
      [userId]
    );

    // Si no existe el registro, inicializar con saldo base (2500 EP)
    if (result.rows.length === 0) {
      await gamePool.query(
        `INSERT INTO ${table} (usuario_id, credits) VALUES ($1, 2500) ON CONFLICT (usuario_id) DO NOTHING`,
        [userId]
      );
      return res.json({ success: true, credits: 2500 });
    }

    res.json({ success: true, credits: result.rows[0].credits });
  } catch (err) {
    console.error(`Error al obtener créditos para ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error al obtener E-Points' });
  }
};

// Adicionar E-Points en un juego específico (tras una compra)
exports.addCredits = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Cantidad no válida' });
  }

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const table = getTableName(schema, 'user_credits');

    const result = await gamePool.query(
      `INSERT INTO ${table} (usuario_id, credits) VALUES ($1, $2 + 2500) 
       ON CONFLICT (usuario_id) DO UPDATE SET credits = ${table}.credits + $2
       RETURNING credits`,
      [userId, amount]
    );

    res.json({ success: true, credits: result.rows[0].credits });
  } catch (err) {
    console.error(`Error al añadir créditos para ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error al abonar E-Points' });
  }
};

// Obtener las skins adquiridas del usuario en el juego
exports.getSkins = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const table = getTableName(schema, 'user_skins');

    const result = await gamePool.query(
      `SELECT skin_id FROM ${table} WHERE usuario_id = $1`,
      [userId]
    );

    const skins = result.rows.map(r => r.skin_id);
    res.json({ success: true, skins });
  } catch (err) {
    console.error(`Error al obtener skins para ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error al recuperar skins' });
  }
};

// Comprar una skin (descuenta créditos y la agrega a inventario en la base de datos de juego)
exports.buySkin = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const { skinId, price } = req.body;

  if (!skinId || price === undefined || price < 0) {
    return res.status(400).json({ success: false, message: 'Datos de compra incompletos o inválidos' });
  }

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const creditsTable = getTableName(schema, 'user_credits');
    const skinsTable = getTableName(schema, 'user_skins');

    // 1. Obtener saldo actual
    let credRes = await gamePool.query(
      `SELECT credits FROM ${creditsTable} WHERE usuario_id = $1`,
      [userId]
    );

    let currentCredits = credRes.rows.length > 0 ? credRes.rows[0].credits : 2500;
    if (credRes.rows.length === 0) {
      // Registrar por primera vez
      await gamePool.query(
        `INSERT INTO ${creditsTable} (usuario_id, credits) VALUES ($1, 2500) ON CONFLICT (usuario_id) DO NOTHING`,
        [userId]
      );
    }

    if (currentCredits < price) {
      return res.status(400).json({ success: false, message: `E-Points insuficientes. Requiere ${price} EP.` });
    }

    // 2. Verificar si ya la compró
    const skinCheck = await gamePool.query(
      `SELECT id FROM ${skinsTable} WHERE usuario_id = $1 AND skin_id = $2`,
      [userId, skinId]
    );

    if (skinCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya has adquirido este artículo.' });
    }

    // 3. Descontar créditos
    const deductRes = await gamePool.query(
      `UPDATE ${creditsTable} SET credits = credits - $1 WHERE usuario_id = $2 RETURNING credits`,
      [price, userId]
    );

    // 4. Agregar skin
    await gamePool.query(
      `INSERT INTO ${skinsTable} (usuario_id, skin_id) VALUES ($1, $2)`,
      [userId, skinId]
    );

    res.json({ 
      success: true, 
      message: 'Artículo adquirido correctamente', 
      credits: deductRes.rows[0].credits 
    });
  } catch (err) {
    console.error(`Error al comprar skin en ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error interno en la transacción' });
  }
};

// Actualizar puntaje del jugador en el juego
exports.updateScore = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const { score } = req.body;

  if (score === undefined) {
    return res.status(400).json({ success: false, message: 'Puntuación requerida' });
  }

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const table = getTableName(schema, 'user_stats');

    await gamePool.query(
      `INSERT INTO ${table} (usuario_id, score, fecha_actualizacion) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (usuario_id) 
       DO UPDATE SET score = $2, fecha_actualizacion = CURRENT_TIMESTAMP`,
      [userId, score.toString()]
    );

    res.json({ success: true, message: 'Puntaje guardado exitosamente.' });
  } catch (err) {
    console.error(`Error al actualizar puntaje en ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error al actualizar puntaje' });
  }
};

// Obtener clasificación de jugadores para el juego
exports.getLeaderboard = async (req, res) => {
  const { gameId } = req.params;

  try {
    const { pool: gamePool, schema } = await getGamePool(gameId);
    const statsTable = getTableName(schema, 'user_stats');

    // Obtener puntajes ordenados por valor numérico
    // Nota: Cast de string a integer para ordenar de forma numérica
    const statsRes = await gamePool.query(
      `SELECT usuario_id, score FROM ${statsTable} 
       ORDER BY 
         CASE WHEN score ~ '^[0-9,]+$' THEN REPLACE(score, ',', '')::INTEGER 
         ELSE 0 END DESC 
       LIMIT 50`
    );

    const userIds = statsRes.rows.map(r => r.usuario_id);
    let usersMap = {};

    if (userIds.length > 0) {
      // Consultar datos de usuario de la base de datos principal
      const usersRes = await pool.query(
        `SELECT id, nombre_usuario, nickname, avatar_url FROM usuarios WHERE id = ANY($1)`,
        [userIds]
      );
      usersRes.rows.forEach(u => {
        usersMap[u.id] = u;
      });
    }

    const leaderboard = statsRes.rows.map((row, index) => {
      const u = usersMap[row.usuario_id] || { nombre_usuario: `Piloto_${row.usuario_id}`, nickname: `Piloto_${row.usuario_id}`, avatar_url: 'none' };
      return {
        rank: index + 1,
        name: u.nickname || u.nombre_usuario,
        score: row.score,
        avatar_url: u.avatar_url,
        color: index === 0 ? 'text-theme-neon' : index === 1 ? 'text-[#c084fc]' : index === 2 ? 'text-[#f87171]' : 'text-theme-muted'
      };
    });

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error(`Error al obtener clasificación en ${gameId}:`, err);
    res.status(500).json({ success: false, message: 'Error al obtener la clasificación' });
  }
};
