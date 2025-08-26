const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { verificarToken } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ ok:false, mensaje:'Faltan credenciales' });
    }

    const [rows] = await pool.query(
      'SELECT idUsuarios, Correo, Password, Rol FROM Usuarios WHERE Correo = ? LIMIT 1',
      [correo]
    );
    if (rows.length === 0) {
      return res.status(401).json({ ok:false, mensaje:'Credenciales inválidas' });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.Password);
    if (!ok) {
      return res.status(401).json({ ok:false, mensaje:'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: u.idUsuarios, rol: u.Rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      mensaje: 'Login correcto',
      token,
      usuario: { id: u.idUsuarios, correo: u.Correo, rol: u.Rol }
    });
  } catch (err) {
    console.error('ERROR /auth/login:', err);
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

// Opcional: ver perfil mediante token
router.get('/me', verificarToken, async (req, res) => {
  try {
    const { id } = req.user;
    const [rows] = await pool.query(
      'SELECT idUsuarios, Correo, Rol FROM Usuarios WHERE idUsuarios = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ ok:false, mensaje:'Usuario no encontrado' });
    res.json({ ok:true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

module.exports = router;

module.exports = router;
