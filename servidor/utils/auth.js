import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const getUserFromReq = async (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    return user ? { id: user.id, role: user.role, name: user.name, email: user.email } : null;
  } catch {
    return null;
  }
};
