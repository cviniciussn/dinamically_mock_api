const express = require('express');
const { query } = require('../db');

let currentRouter = null;

async function buildRouter() {
  const router = express.Router();
  const { rows } = await query('SELECT * FROM mock_routes ORDER BY id');

  for (const route of rows) {
    const method = route.method.toLowerCase();
    if (!router[method]) continue;

    router[method](route.path, (req, res) => {
      const send = () => {
        res.status(route.status_code);
        res.set('Content-Type', route.content_type);
        if (route.content_type.includes('json')) {
          try {
            res.json(JSON.parse(route.response_body));
          } catch {
            res.send(route.response_body);
          }
        } else {
          res.send(route.response_body);
        }
      };

      if (route.delay_ms > 0) {
        setTimeout(send, route.delay_ms);
      } else {
        send();
      }
    });
  }

  currentRouter = router;
  console.log(`Mock router rebuilt with ${rows.length} route(s).`);
  return router;
}

function mockMiddleware(req, res, next) {
  if (!currentRouter) return next();
  currentRouter(req, res, next);
}

module.exports = { buildRouter, mockMiddleware };
