const express = require('express');
const { query } = require('../db');
const { buildRouter } = require('./mock');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await query('SELECT * FROM mock_routes ORDER BY id DESC');
  res.render('index', { routes: rows, success: req.query.success, error: req.query.error });
});

router.get('/new', (req, res) => {
  res.render('form', { route: null, error: null });
});

router.post('/routes', async (req, res) => {
  const { method, path, status_code, response_body, content_type, delay_ms, description } = req.body;

  try {
    JSON.parse(response_body);
  } catch {
    if ((content_type || 'application/json').includes('json')) {
      return res.render('form', {
        route: req.body,
        error: 'Response body is not valid JSON.'
      });
    }
  }

  try {
    await query(
      `INSERT INTO mock_routes (method, path, status_code, response_body, content_type, delay_ms, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [method.toUpperCase(), path, parseInt(status_code) || 200, response_body, content_type || 'application/json', parseInt(delay_ms) || 0, description || '']
    );
    await buildRouter();
    res.redirect('/admin?success=Route+created');
  } catch (err) {
    if (err.code === '23505') {
      return res.render('form', { route: req.body, error: `Route ${method.toUpperCase()} ${path} already exists.` });
    }
    return res.render('form', { route: req.body, error: err.message });
  }
});

router.get('/routes/:id/edit', async (req, res) => {
  const { rows } = await query('SELECT * FROM mock_routes WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.redirect('/admin?error=Route+not+found');
  res.render('form', { route: rows[0], error: null });
});

router.post('/routes/:id', async (req, res) => {
  const { method, path, status_code, response_body, content_type, delay_ms, description, _method } = req.body;

  if (_method === 'DELETE') {
    await query('DELETE FROM mock_routes WHERE id = $1', [req.params.id]);
    await buildRouter();
    return res.redirect('/admin?success=Route+deleted');
  }

  try {
    JSON.parse(response_body);
  } catch {
    if ((content_type || 'application/json').includes('json')) {
      return res.render('form', {
        route: { ...req.body, id: req.params.id },
        error: 'Response body is not valid JSON.'
      });
    }
  }

  try {
    await query(
      `UPDATE mock_routes SET method=$1, path=$2, status_code=$3, response_body=$4, content_type=$5, delay_ms=$6, description=$7, updated_at=NOW()
       WHERE id=$8`,
      [method.toUpperCase(), path, parseInt(status_code) || 200, response_body, content_type || 'application/json', parseInt(delay_ms) || 0, description || '', req.params.id]
    );
    await buildRouter();
    res.redirect('/admin?success=Route+updated');
  } catch (err) {
    if (err.code === '23505') {
      return res.render('form', { route: { ...req.body, id: req.params.id }, error: `Route ${method.toUpperCase()} ${path} already exists.` });
    }
    return res.render('form', { route: { ...req.body, id: req.params.id }, error: err.message });
  }
});

router.post('/routes/:id/delete', async (req, res) => {
  await query('DELETE FROM mock_routes WHERE id = $1', [req.params.id]);
  await buildRouter();
  res.redirect('/admin?success=Route+deleted');
});

module.exports = router;
