require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/modules/auth/auth.routes');
const rolesRoutes = require('./src/modules/roles/roles.routes');
const usuariosRoutes = require('./src/modules/usuarios/usuarios.routes');
const { rutaNoEncontrada, manejarErrores } = require('./src/middlewares/manejarErrores');

const app = express();

app.use(cors());
app.use(express.json());
app.get('/ping', (req, res) => res.send('pong'));

app.use('/auth', authRoutes);
app.use('/roles', rolesRoutes);
app.use('/usuarios', usuariosRoutes);

// Siempre al final: primero "ruta no encontrada", luego el manejador de errores.
app.use(rutaNoEncontrada);
app.use(manejarErrores);

app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));