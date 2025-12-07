import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Whitelist de colecciones permitidas
const ALLOWED = new Set([
  'users',
  'meals',
  'user_supplements',
  'user_routines',
  'foods',
  'supplements',
  'training_routines',
  'training_exercises',
  'nutrition_settings',
  'projects',
]);

const parseId = (id) => {
  try {
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      return new mongoose.Types.ObjectId(id);
    }
  } catch {}
  return id;
};

// Middleware para validar colección
const ensureCollection = (req, res, next) => {
  const { collection } = req.params;
  if (!ALLOWED.has(collection)) {
    return res.status(400).json({ error: `Colección no permitida: ${collection}` });
  }
  next();
};

// Listar documentos
router.get('/crud/:collection', ensureCollection, async (req, res) => {
  try {
    const { collection } = req.params;
    const db = mongoose.connection.db;
    const docs = await db.collection(collection).find({}).toArray();
    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al listar documentos' });
  }
});

// Obtener por id
router.get('/crud/:collection/:id', ensureCollection, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const _id = parseId(id);
    const db = mongoose.connection.db;
    const doc = await db.collection(collection).findOne({ _id });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
});

// Crear documento
router.post('/crud/:collection', ensureCollection, requireAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const body = req.body || {};
    const db = mongoose.connection.db;
    const r = await db.collection(collection).insertOne(body);
    res.status(201).json({ _id: r.insertedId, ...body });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear documento' });
  }
});

// Actualizar documento parcialmente
router.patch('/crud/:collection/:id', ensureCollection, requireAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const _id = parseId(id);
    const updates = req.body || {};
    const db = mongoose.connection.db;
    const r = await db.collection(collection).updateOne({ _id }, { $set: updates });
    if (!r.matchedCount) return res.status(404).json({ error: 'No encontrado' });
    const doc = await db.collection(collection).findOne({ _id });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al actualizar documento' });
  }
});

// Eliminar documento
router.delete('/crud/:collection/:id', ensureCollection, requireAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const _id = parseId(id);
    const db = mongoose.connection.db;
    const r = await db.collection(collection).deleteOne({ _id });
    if (!r.deletedCount) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

export default router;
