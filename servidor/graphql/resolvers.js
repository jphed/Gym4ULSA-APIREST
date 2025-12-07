import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => user || null,
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('No autorizado');
      return User.find();
    },
    projects: async () => Project.find().populate('owner'),
  },
  Mutation: {
    signup: async (_, { name, email, password }) => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error('Email en uso');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash });
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Credenciales inválidas');
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error('Credenciales inválidas');
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    createProject: async (_, { name, description }, { user }) => {
      if (!user) throw new Error('No autenticado');
      const project = await Project.create({ name, description, owner: user.id });
      return project.populate('owner');
    },
  },
};
