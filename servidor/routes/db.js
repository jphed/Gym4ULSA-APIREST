import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/db/dump -> lista todas las colecciones y documentos
router.get('/dump', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ error: 'DB no conectada' });

    const collections = await db.listCollections().toArray();
    const result = {};
    for (const c of collections) {
      const name = c.name;
      const docs = await db.collection(name).find({}).toArray();
      result[name] = docs;
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al leer colecciones' });
  }
});

export default router;
