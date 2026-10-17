require('dotenv').config();
const express = require('express');
const { ok, fail } = require('./src/utils/apiResponse');
const authService = require('./src/modules/auth/auth.service');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/ping', (req, res) => res.send('pong'));

app.post('/auth/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return fail(res, 400, 'DATOS_FALTANTES', 'Correo y contraseña son obligatorios');

  try {
    const resultado = await authService.login(correo, password);
    return ok(res, resultado);
  } catch (err) {
    return fail(res, err.status || 500, err.code || 'ERROR_INTERNO', err.message || 'Error inesperado');
  }
});

app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));