/**
 * Haji Cosmétique – Backend Server
 * Stack : Node.js + Express + MySQL + Nodemailer
 * Routes : /api/products, /api/orders, /api/shipping-costs,
 *          /api/news, /api/videos, /api/newsletter, /api/admin/*
 */

const express    = require('express');
const cors       = require('cors');
const mysql      = require('mysql2/promise');
const nodemailer = require('nodemailer');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'haji_secret_2025';

// ── Middleware ─────────────────────────────────────────────────────────────────
// CORS: accept all in dev, restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://haji-cosm-tique.vercel.app')
    : '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

// Health check + GET guard for admin login (browser sometimes sends GET)
app.get('/api/health', (req, res) => res.json({ status:'ok', app:'Haji Cosmetique API' }));
app.get('/api/admin/login', (req, res) => res.status(200).json({ info:'POST to this endpoint with {username,password}' }));

// ── MySQL Pool ─────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host    : process.env.DB_HOST     || 'localhost',
  user    : process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'haji_db',
  waitForConnections: true,
  connectionLimit   : 10,
});

// ── Nodemailer ─────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host  : process.env.SMTP_HOST || 'smtp.gmail.com',
  port  : Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth  : {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// ── Auth Middleware ────────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ── Frais de livraison Tunisie ────────────────────────────────────────────────
const SHIPPING_COSTS = {
  'Tunis': 8, 'Sfax': 10, 'Sousse': 9, 'Kairouan': 11,
  'Bizerte': 10, 'Gabès': 13, 'Ariana': 8, 'Gafsa': 14,
  'Monastir': 9, 'Ben Arous': 8, 'Kasserine': 13, 'Médenine': 14,
  'Nabeul': 10, 'Tataouine': 16, 'Béja': 11, 'Jendouba': 12,
  'Le Kef': 12, 'Mahdia': 10, 'Sidi Bouzid': 13, 'Siliana': 12,
  'Tozeur': 15, 'Zaghouan': 9, 'Manouba': 8, 'Kébili': 15,
};

// ════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════════════════════════

// GET /api/shipping-costs
app.get('/api/shipping-costs', (req, res) => res.json(SHIPPING_COSTS));

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
    if (search) { query += ' AND (name_fr LIKE ? OR name_ar LIKE ? OR category LIKE ?)'; const s = `%${search}%`; params.push(s,s,s); }
    if (sort === 'price-asc')  query += ' ORDER BY price ASC';
    else if (sort === 'price-desc') query += ' ORDER BY price DESC';
    else query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/news
app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/videos
app.get('/api/videos', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { name, phone, email, city, address, items, note } = req.body;
  if (!name || !phone || !city || !address || !items?.length)
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });

  const shippingCost = SHIPPING_COSTS[city] ?? 10;
  const subtotal     = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total        = subtotal + shippingCost;
  const itemsSummary = items.map(i => `${i.name} ×${i.qty}`).join(', ');

  try {
    const [result] = await pool.execute(
      `INSERT INTO orders (name, phone, email, city, address, items, note, shipping_cost, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, phone, email||'', city, address, JSON.stringify(items), note||'', shippingCost, total]
    );
    const orderId = result.insertId;

    // Email au fondateur
    if (process.env.SMTP_USER && process.env.OWNER_EMAIL) {
      await transporter.sendMail({
        from   : `"Haji Cosmétique" <${process.env.SMTP_USER}>`,
        to     : process.env.OWNER_EMAIL,
        subject: `🛍️ Nouvelle commande #${orderId} – ${name} – ${city}`,
        html   : `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#1a1a1a">
            <div style="background:#2d5a27;padding:20px 30px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0">🧴 Haji Cosmétique</h2>
              <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:.9rem">Nouvelle commande reçue</p>
            </div>
            <div style="background:#fff;padding:30px;border:1px solid #e0d8d0;border-top:none;border-radius:0 0 8px 8px">
              <table style="width:100%;border-collapse:collapse;font-size:.95rem">
                <tr style="background:#f5f0eb"><td style="padding:10px;font-weight:700" colspan="2">Commande #${orderId}</td></tr>
                <tr><td style="padding:8px;color:#666;width:40%">Client</td><td style="padding:8px"><strong>${name}</strong></td></tr>
                <tr><td style="padding:8px;color:#666">Téléphone</td><td style="padding:8px">${phone}</td></tr>
                <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${email||'—'}</td></tr>
                <tr><td style="padding:8px;color:#666">Ville</td><td style="padding:8px">${city}</td></tr>
                <tr><td style="padding:8px;color:#666">Adresse</td><td style="padding:8px">${address}</td></tr>
                <tr><td style="padding:8px;color:#666">Produits</td><td style="padding:8px">${itemsSummary}</td></tr>
                <tr><td style="padding:8px;color:#666">Note</td><td style="padding:8px">${note||'—'}</td></tr>
                <tr><td style="padding:8px;color:#666">Livraison</td><td style="padding:8px">${shippingCost} TND</td></tr>
                <tr style="font-size:1.1em;background:#e8f2ec"><td style="padding:10px;font-weight:700">TOTAL</td><td style="padding:10px;font-weight:700;color:#2d5a27">${total} TND</td></tr>
              </table>
              <p style="margin-top:20px;font-size:.85rem;color:#999">Connectez-vous au dashboard admin pour gérer cette commande.</p>
            </div>
          </div>`,
      });
    }

    // Email de confirmation au client
    if (email) {
      await transporter.sendMail({
        from   : `"Haji Cosmétique" <${process.env.SMTP_USER}>`,
        to     : email,
        subject: `✅ Commande confirmée #${orderId} – Haji Cosmétique`,
        html   : `<div style="font-family:sans-serif;max-width:500px;margin:auto;text-align:center;padding:30px">
          <h2 style="color:#2d5a27">Merci ${name} !</h2>
          <p>Votre commande <strong>#${orderId}</strong> a bien été reçue.</p>
          <p>Total : <strong>${total} TND</strong></p>
          <p>Nous vous contacterons au <strong>${phone}</strong> pour confirmer la livraison.</p>
          <p style="color:#999;font-size:.85rem;margin-top:20px">Haji Cosmétique – Sfax, Tunisie</p>
        </div>`,
      });
    }

    res.status(201).json({ message: 'Commande créée.', orderId, total });
  } catch (err) {
    console.error('Erreur /api/orders :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });
  try {
    await pool.execute('INSERT IGNORE INTO newsletter (email) VALUES (?)', [email]);
    res.json({ message: 'Abonné avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Identifiants incorrects.' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });
    const token = jwt.sign({ id: rows[0].id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ products }]] = await pool.execute('SELECT COUNT(*) as products FROM products');
    const [[{ orders }]]   = await pool.execute('SELECT COUNT(*) as orders FROM orders');
    const [[{ revenue }]]  = await pool.execute("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status != 'cancelled'");
    const [[{ subscribers }]] = await pool.execute('SELECT COUNT(*) as subscribers FROM newsletter');
    res.json({ products, orders, revenue, subscribers });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/orders
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/orders/:id
app.patch('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/orders/:id
app.delete('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Commande supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/products
app.post('/api/admin/products', authMiddleware, async (req, res) => {
  const { name_fr, name_ar, price, old_price, category, stock, emoji, badge, desc_fr, desc_ar, ingredients, image } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO products (name_fr, name_ar, price, old_price, category, stock, emoji, badge, desc_fr, desc_ar, ingredients, image)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name_fr, name_ar, price, old_price||null, category, stock||0, emoji||'🧴', badge||'', desc_fr||'', desc_ar||'', ingredients||'', image||null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/admin/products/:id
app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const { name_fr, name_ar, price, old_price, category, stock, emoji, badge, desc_fr, desc_ar, ingredients, image } = req.body;
  try {
    await pool.execute(
      `UPDATE products SET name_fr=?, name_ar=?, price=?, old_price=?, category=?, stock=?, emoji=?, badge=?, desc_fr=?, desc_ar=?, ingredients=?, image=? WHERE id=?`,
      [name_fr, name_ar, price, old_price||null, category, stock||0, emoji||'🧴', badge||'', desc_fr||'', desc_ar||'', ingredients||'', image||null, req.params.id]
    );
    res.json({ message: 'Produit mis à jour.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/products/:id
app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/news
app.post('/api/admin/news', authMiddleware, async (req, res) => {
  const { title_fr, title_ar, excerpt_fr, excerpt_ar, category, emoji } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO news (title_fr, title_ar, excerpt_fr, excerpt_ar, category, emoji) VALUES (?,?,?,?,?,?)',
      [title_fr, title_ar||'', excerpt_fr||'', excerpt_ar||'', category||'Actualité', emoji||'📰']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/news/:id
app.delete('/api/admin/news/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/videos
app.post('/api/admin/videos', authMiddleware, async (req, res) => {
  const { title, url, emoji } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO videos (title, url, emoji) VALUES (?,?,?)',
      [title, url||'', emoji||'🎬']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/videos/:id
app.delete('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vidéo supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── Démarrage ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`✅  Haji Cosmétique API → http://localhost:${PORT}`));
const mysql = require('mysql2/promise');

// احذف السطر الذي يحتوي على const mysql = require... واكتب هذا مباشرة:

pool.getConnection()
  .then(connection => {
    console.log("✅✅✅ Connected to TiDB MySQL successfully! ✅✅✅");
    connection.release();
  })
  .catch(err => {
    console.error("❌❌❌ Database connection failed! Error:", err.message);
  });
