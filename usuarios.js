const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const { verificarToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Todas las rutas de usuarios: solo admin y secretaria
router.use(verificarToken, authorize('administrador', 'secretaria'));

/**
 * GET /usuarios
 * Query params opcionales:
 *   estado: activo|baja
 *   page, limit, sort (idUsuarios|Correo|Rol|Estado), dir (ASC|DESC)
 */
router.get('/', async (req, res) => {
  try {
    const estado = req.query.estado; // 'activo' | 'baja' | undefined
    const page   = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit  = Math.max(1, parseInt(req.query.limit || '10', 10));
    const offset = (page - 1) * limit;

    const sortAllow = new Set(['idUsuarios', 'Correo', 'Rol', 'Estado']);
    const sort = sortAllow.has(req.query.sort) ? req.query.sort : 'idUsuarios';
    const dir  = (String(req.query.dir || 'ASC').toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    let where = '1=1';
    const args = [];
    if (estado && (estado === 'activo' || estado === 'baja')) {
      where += ' AND Estado = ?';
      args.push(estado);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM Usuarios WHERE ${where}`, args);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT idUsuarios, Correo, Rol, Estado
       FROM Usuarios
       WHERE ${where}
       ORDER BY ${sort} ${dir}
       LIMIT ? OFFSET ?`,
      [...args, limit, offset]
    );

    res.json({
      ok: true,
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (e) {
    console.error('ERROR GET /usuarios:', e);
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** GET /usuarios/:id -> ficha */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      'SELECT idUsuarios, Correo, Rol, Estado FROM Usuarios WHERE idUsuarios = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ ok:false, mensaje:'No encontrado' });
    res.json({ ok:true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** POST /usuarios -> crear (hasheando contraseña) */
router.post('/', async (req, res) => {
  try {
    const { Correo, Password, Rol } = req.body;
    if (!Correo || !Password || !Rol) {
      return res.status(400).json({ ok:false, mensaje:'Faltan campos obligatorios' });
    }
    const hash = await bcrypt.hash(Password, 10);
    const [r] = await pool.query(
      'INSERT INTO Usuarios (Correo, Password, Rol, Estado) VALUES (?,?,?, "activo")',
      [Correo, hash, Rol]
    );
    res.json({ ok:true, id: r.insertId });
  } catch (e) {
    if (e?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok:false, mensaje:'El correo ya está registrado' });
    }
    console.error('ERROR POST /usuarios:', e);
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** PUT /usuarios/:id -> modificar correo/rol (y opcional Estado) */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { Correo, Rol, Estado } = req.body;

    const sets = [];
    const args = [];
    if (Correo) { sets.push('Correo = ?'); args.push(Correo); }
    if (Rol)    { sets.push('Rol = ?');    args.push(Rol); }
    if (Estado && (Estado === 'activo' || Estado === 'baja')) { sets.push('Estado = ?'); args.push(Estado); }
    if (sets.length === 0) return res.status(400).json({ ok:false, mensaje:'Nada que actualizar' });

    args.push(id);
    const [r] = await pool.query(`UPDATE Usuarios SET ${sets.join(', ')} WHERE idUsuarios = ?`, args);
    if (r.affectedRows === 0) return res.status(404).json({ ok:false, mensaje:'No encontrado' });
    res.json({ ok:true, mensaje:'Actualizado' });
  } catch (e) {
    if (e?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok:false, mensaje:'El correo ya está registrado' });
    }
    console.error('ERROR PUT /usuarios/:id:', e);
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** PATCH /usuarios/:id/password -> reset de contraseña */
router.patch('/:id/password', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { Password } = req.body;
    if (!Password) return res.status(400).json({ ok:false, mensaje:'Password requerido' });
    const hash = await bcrypt.hash(Password, 10);
    const [r] = await pool.query('UPDATE Usuarios SET Password = ? WHERE idUsuarios = ?', [hash, id]);
    if (r.affectedRows === 0) return res.status(404).json({ ok:false, mensaje:'No encontrado' });
    res.json({ ok:true, mensaje:'Contraseña actualizada' });
  } catch (e) {
    console.error('ERROR PATCH /usuarios/:id/password:', e);
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** PATCH /usuarios/:id/baja */
router.patch('/:id/baja', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.query('UPDATE Usuarios SET Estado="baja" WHERE idUsuarios=?', [id]);
    if (!r.affectedRows) return res.status(404).json({ ok:false, mensaje:'No encontrado' });
    res.json({ ok:true, mensaje:'Usuario dado de baja' });
  } catch (e) {
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

/** PATCH /usuarios/:id/activar */
router.patch('/:id/activar', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.query('UPDATE Usuarios SET Estado="activo" WHERE idUsuarios=?', [id]);
    if (!r.affectedRows) return res.status(404).json({ ok:false, mensaje:'No encontrado' });
    res.json({ ok:true, mensaje:'Usuario activado' });
  } catch (e) {
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

module.exports = router;
