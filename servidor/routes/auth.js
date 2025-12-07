import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    console.log('Datos recibidos en signup:', JSON.stringify(req.body, null, 2));
    
    const { 
      name, 
      email, 
      password, 
      age = "", 
      sex = "other", 
      height_cm = 0, 
      weight_kg = "", 
      goal, 
      activity_level = "", 
      experiencia = "principiante"
    } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    
    // Verificar si el email ya existe
    const db = mongoose.connection.db;
    const exists = await db.collection('users').findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email en uso' });
    }
    
    // Crear usuario con la misma estructura que los usuarios existentes
    const userData = {
      name,
      email,
      password, // Usar password en texto plano como los usuarios existentes
      age: String(age ?? "").trim(),
      sex: (sex || "other").trim(),
      height_cm: String(height_cm ?? "").trim(),
      weight_kg: String(weight_kg ?? "").trim(),
      goal: {
        type: goal?.type || "deficit",
        target_weight_kg: String(goal?.target_weight_kg ?? "").trim(),
        rate_per_week_kg: String(goal?.rate_per_week_kg ?? "").trim()
      },
      created_utc: new Date(),
      activity_level: activity_level?.trim() || "N/A",
      experiencia: experiencia || "principiante"
    };
    
    console.log('Datos a insertar:', JSON.stringify(userData, null, 2));
    
    // Insertar directamente en MongoDB para evitar validaciones de Mongoose
    const result = await db.collection('users').insertOne(userData);
    console.log('Usuario creado exitosamente:', result.insertedId);
    
    // Generar token
    const token = jwt.sign({ id: result.insertedId.toString(), role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: result.insertedId.toString(), 
        name, 
        email, 
        role: 'USER' 
      } 
    });
  } catch (e) {
    console.error('Error en signup:', e);
    if (e?.errInfo?.details) {
      console.error('Detalles de validación:', JSON.stringify(e.errInfo.details, null, 2));
    }
    res.status(500).json({ error: 'Error interno', details: e.message, validation: e?.errInfo?.details || null });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    let valid = false;
    if (user.passwordHash) {
      valid = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
      // Fallback para datos con password en texto plano (solo para desarrollo)
      valid = password === user.password;
    }
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Endpoint minimal para debug
router.post('/minimal-signup', async (req, res) => {
  try {
    console.log('MINIMAL: Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { name, email, password } = req.body;
    
    // Crear el usuario más simple posible - igual que los existentes
    const db = mongoose.connection.db;
    const userData = {
      name: name,
      email: email,
      password: password
    };
    
    console.log('MINIMAL: Datos a insertar:', JSON.stringify(userData, null, 2));
    
    const result = await db.collection('users').insertOne(userData);
    console.log('MINIMAL: Usuario insertado:', result.insertedId);
    
    res.status(201).json({ 
      message: 'Usuario creado',
      id: result.insertedId.toString()
    });
  } catch (e) {
    console.error('MINIMAL ERROR:', e);
    res.status(500).json({ error: 'Minimal error', details: e.message });
  }
});

// Endpoint que solo prueba la conexión sin insertar
router.post('/test-connection', async (req, res) => {
  try {
    console.log('TEST: Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    res.json({ 
      message: 'Conexión exitosa', 
      collections: collections.map(c => c.name),
      received: req.body
    });
  } catch (e) {
    console.error('TEST ERROR:', e);
    res.status(500).json({ error: 'Test error', details: e.message });
  }
});

export default router;
