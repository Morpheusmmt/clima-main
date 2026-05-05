const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const climaRoutes = require('./routes/clima');
const cidadesRoutes = require('./routes/cidade');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'");
  next();
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => res.json({ message: 'API Clima' }));

app.use('/api/v1', healthRoutes);
app.use('/api/v1', climaRoutes);
app.use('/api/v1', cidadesRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;