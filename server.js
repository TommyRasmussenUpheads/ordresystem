const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory order queue: id -> { id, addedAt, expiresAt, timer }
const orders = new Map();

const AUTO_REMOVE_MS = 3 * 60 * 1000; // 3 minutes

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getOrderList() {
  return Array.from(orders.values())
    .map(o => ({ id: o.id, addedAt: o.addedAt, expiresAt: o.expiresAt }))
    .sort((a, b) => a.addedAt - b.addedAt);
}

function broadcast() {
  const msg = JSON.stringify({ type: 'orders', data: getOrderList() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

function addOrder(id) {
  if (orders.has(id)) return false;
  const now = Date.now();
  const timer = setTimeout(() => {
    orders.delete(id);
    broadcast();
  }, AUTO_REMOVE_MS);
  orders.set(id, { id, addedAt: now, expiresAt: now + AUTO_REMOVE_MS, timer });
  broadcast();
  return true;
}

function removeOrder(id) {
  const order = orders.get(id);
  if (!order) return false;
  clearTimeout(order.timer);
  orders.delete(id);
  broadcast();
  return true;
}

// REST API
app.post('/api/orders', (req, res) => {
  const { id } = req.body;
  if (!id || typeof id !== 'string' || !id.trim())
    return res.status(400).json({ error: 'Ugyldig ordrenummer' });
  const trimmed = id.trim();
  if (!addOrder(trimmed))
    return res.status(409).json({ error: 'Ordre finnes allerede i køen' });
  res.json({ success: true, id: trimmed });
});

app.delete('/api/orders/:id', (req, res) => {
  if (!removeOrder(decodeURIComponent(req.params.id)))
    return res.status(404).json({ error: 'Ordre ikke funnet' });
  res.json({ success: true });
});

app.get('/api/orders', (req, res) => res.json(getOrderList()));

// Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Send current state on WS connect
wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'orders', data: getOrderList() }));
});

const PORT = process.env.PORT || 8090;
server.listen(PORT, () => {
  console.log(`✅ Ordresystem kjører på http://localhost:${PORT}`);
  console.log(`   Kundeskjerm : http://localhost:${PORT}/`);
  console.log(`   Admin       : http://localhost:${PORT}/admin`);
});
