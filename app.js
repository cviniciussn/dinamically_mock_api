require('dotenv').config({ path: '.env' });

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { waitForConnection } = require('./src/db');
const { migrate } = require('./src/migrate');
const { buildRouter, mockRouter } = require('./src/routes/mock');
const adminRoutes = require('./src/routes/admin');

const app = express();
const port = parseInt(process.env.PORT || '3001');
const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/admin', adminRoutes);

app.use(mockRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'No mock route matches this request.', method: req.method, path: req.path });
});

async function start() {
  await waitForConnection();
  await migrate();
  await buildRouter();

  if (httpsEnabled) {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY || 'server.key'),
      cert: fs.readFileSync(process.env.SSL_CERT || 'server.crt'),
    };
    https.createServer(options, app).listen(port, () => {
      console.log(`Mock server running at https://localhost:${port}`);
      console.log(`Admin panel: https://localhost:${port}/admin`);
    });
  } else {
    http.createServer(app).listen(port, () => {
      console.log(`Mock server running at http://localhost:${port}`);
      console.log(`Admin panel: http://localhost:${port}/admin`);
    });
  }
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
