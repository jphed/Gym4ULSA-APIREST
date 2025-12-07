import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI no está configurado');
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    dbName: new URL(mongoUri).pathname.replace('/', '') || undefined,
  });
  console.log('MongoDB conectado');
};
