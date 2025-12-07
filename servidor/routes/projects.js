import { Router } from 'express';
import Project from '../models/Project.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/projects - público
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('owner');
    res.json(projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      owner: p.owner ? { id: p.owner.id, name: p.owner.name, email: p.owner.email } : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/projects - requiere auth (Bearer <token>)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name es requerido' });
    const project = await Project.create({ name, description, owner: req.user.id });
    const populated = await project.populate('owner');
    res.status(201).json({
      id: populated.id,
      name: populated.name,
      description: populated.description,
      owner: { id: populated.owner.id, name: populated.owner.name, email: populated.owner.email },
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
