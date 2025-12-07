import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { connectDB } from './config/db.js';
import { getUserFromReq } from './utils/auth.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import dbRouter from './routes/db.js';
import userRouter from './routes/user.js';
import crudRouter from './routes/crud.js';

// Hardcoded configuration
const MONGODB_URI = 'mongodb+srv://JorgeParra:4209@clusterulsa.ebajblo.mongodb.net/gym4ulsa?retryWrites=true&w=majority&appName=atlas-app';
const JWT_SECRET = 'dev_secret_change_later';
const PORT = 4001;

// Make JWT available to modules using process.env
process.env.JWT_SECRET = JWT_SECRET;

async function start() {
  await connectDB(MONGODB_URI);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // REST API
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/db', dbRouter);
  app.use('/api/user', userRouter);
  app.use('/api', crudRouter);

  // GraphQL API
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ user: await getUserFromReq(req) })
  }));

  app.get('/', (req, res) => res.send('API viva. REST en /api/* y GraphQL en /graphql'));

  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
