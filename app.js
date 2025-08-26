const express = require("express");
const cors = require("cors");
const db = require("../db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ping
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API MTK funcionando 🚀" });
});

// Login
app.post("/ingresoSistema", (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ ok: false, msg: "Datos incompletos" });
  }
  const sql = 'SELECT * FROM usuarios WHERE Usuario = ? AND Contrasena = ? AND Estado = "activo"';
  db.query(sql, [usuario, password], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: "Error interno del servidor" });
    if (rows.length > 0) return res.json({ ok: true, msg: "Ingreso correcto", usuario: rows[0] });
    return res.status(401).json({ ok: false, msg: "Credenciales inválidas o usuario inactivo" });
  });
});

// Listado de usuarios
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: "Error interno del servidor" });
    res.json({ ok: true, data: rows });
  });
});

module.exports = app;
