import { getUserFromReq } from '../utils/auth.js';

export const requireAuth = async (req, res, next) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  req.user = user;
  next();
};
