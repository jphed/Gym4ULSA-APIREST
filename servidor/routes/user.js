import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/user/me - perfil del usuario autenticado
router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PATCH /api/user/me - actualizar perfil
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const allowed = ['name', 'age', 'sex', 'height_cm', 'weight_kg', 'activity_level', 'goal'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowed.includes(k)));
    const db = mongoose.connection.db;
    const filter = { _id: new mongoose.Types.ObjectId(req.user.id) };
    await db.collection('users').updateOne(filter, { $set: updates });
    const updated = await db.collection('users').findOne(filter);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// POST /api/user/meals - crear registro de comidas para un día
router.post('/meals', requireAuth, async (req, res) => {
  try {
    const { date, meals = [], summary = null } = req.body || {};
    if (!date) return res.status(400).json({ error: 'date es requerido (YYYY-MM-DD)' });
    const doc = { user_id: req.user.id, date, meals, summary };
    const db = mongoose.connection.db;
    const r = await db.collection('meals').insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear comidas' });
  }
});

// PUT /api/user/routines - asignar rutinas al usuario
router.put('/routines', requireAuth, async (req, res) => {
  try {
    let { routine_ids } = req.body || {};
    if (!Array.isArray(routine_ids)) routine_ids = [];
    routine_ids = routine_ids.map((x) => (typeof x === 'number' ? x : Number(x))).filter((n) => !Number.isNaN(n));
    const db = mongoose.connection.db;
    await db.collection('user_routines').updateOne(
      { user_id: req.user.id },
      { $set: { user_id: req.user.id, routine_ids } },
      { upsert: true }
    );
    const doc = await db.collection('user_routines').findOne({ user_id: req.user.id });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al asignar rutinas' });
  }
});

// PUT /api/user/supplements - asignar suplementos al usuario
router.put('/supplements', requireAuth, async (req, res) => {
  try {
    let { supplement_ids } = req.body || {};
    if (!Array.isArray(supplement_ids)) supplement_ids = [];
    const db = mongoose.connection.db;
    await db.collection('user_supplements').updateOne(
      { user_id: req.user.id },
      { $set: { user_id: req.user.id, supplement_ids } },
      { upsert: true }
    );
    const doc = await db.collection('user_supplements').findOne({ user_id: req.user.id });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al asignar suplementos' });
  }
});

export default router;
