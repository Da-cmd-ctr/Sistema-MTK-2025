require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

async function ensureDbAndAdmin() {
  // Prueba de conexión
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('✅ Conectado a MySQL');

  // Crea admin si no existe ese correo
  const email = process.env.ADMIN_EMAIL || 'admin@mtk.com';
  const pass  = process.env.ADMIN_PASS || 'admin123';
  const rol   = process.env.ADMIN_ROL  || 'administrador';

  const [rows] = await pool.query('SELECT idUsuarios FROM Usuarios WHERE Correo = ? LIMIT 1', [email]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(pass, 10);
    await pool.query(
      'INSERT INTO Usuarios (Correo, Password, Rol) VALUES (?,?,?)',
      [email, hash, rol]
    );
    console.log(`✅ Admin inicial creado: ${email} / ${pass}`);
  } else {
    console.log('ℹ️ Admin ya existe, no se crea nuevamente');
  }
}

ensureDbAndAdmin().catch(e => {
  console.error('❌ Error inicializando:', e.message);
});

// Rutas
app.get('/', (req, res) => res.send('API OK'));
app.use('/auth', require('./routes/auth'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/clases', require('./routes/clases'));

// 404
app.use((req, res) => res.status(404).json({ ok:false, mensaje:'No encontrado' }));

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
