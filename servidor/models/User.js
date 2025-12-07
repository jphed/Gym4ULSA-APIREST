import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    // Campo opcional para datasets de desarrollo con contraseña en texto plano
    password: { type: String },
    role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
