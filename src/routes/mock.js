const express = require('express');
const { query } = require('../db');

const mockRouter = express.Router();

async function buildRouter() {
  mockRouter.stack = [];

  const { rows } = await query('SELECT * FROM mock_routes ORDER BY id');

  let registered = 0;
  const skipped = [];

  for (const route of rows) {
    try {
      const method = String(route.method || '').toLowerCase();
      if (typeof mockRouter[method] !== 'function') {
        skipped.push({ route, reason: `Unsupported method: ${route.method}` });
        continue;
      }

      mockRouter[method](route.path, (req, res) => {
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
      registered++;
    } catch (err) {
      skipped.push({ route, reason: err.message });
    }
  }

  console.log(`Mock router rebuilt with ${registered} route(s).`);
  if (skipped.length) {
    console.warn(`Skipped ${skipped.length} invalid route(s):`);
    for (const { route, reason } of skipped) {
      console.warn(`  - [${route.method} ${route.path}] (id=${route.id}): ${reason}`);
    }
  }
  return mockRouter;
}

module.exports = { buildRouter, mockRouter };
