import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    // Campo opcional para datasets de desarrollo con contraseña en texto plano
    password: { type: String },
    role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
    // Campos adicionales para la app de Android
    age: { type: mongoose.Schema.Types.Mixed, default: "" },
    sex: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    height_cm: { type: Number, default: 0 },
    weight_kg: { type: mongoose.Schema.Types.Mixed, default: "" },
    goal: {
      type: { type: String, enum: ['deficit', 'volume'], default: 'deficit' },
      target_weight_kg: { type: Number, default: 0 },
      rate_per_week_kg: { type: Number, default: 0.5 }
    },
    activity_level: { type: String, default: "" },
    experiencia: {
      type: String,
      enum: ['principiante', 'intermedio', 'avanzado'],
      default: 'principiante'
    },
    created_utc: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    strict: false  // Deshabilitar validación estricta
  }
);

export default mongoose.model('User', userSchema);
