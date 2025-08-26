const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verificarToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Accesible por administrador, secretaria y sensei (ajusta según necesites)
router.use(verificarToken, authorize('administrador', 'secretaria', 'sensei'));

router.get('/', async (req, res) => {
  try {
    // TODO: reemplaza por tu tabla real de clases cuando la tengas
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok:true, data: rows });
  } catch (e) {
    res.status(500).json({ ok:false, mensaje:'Error en el servidor' });
  }
});

module.exports = router;
