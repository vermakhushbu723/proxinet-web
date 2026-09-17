import mongoose from 'mongoose';
import { env } from '../config/env.js';

mongoose.set('strictQuery', true);

// Cached across hot reloads and serverless invocations
const cache = globalThis.__pxMongo || (globalThis.__pxMongo = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongoUri, { dbName: env.dbName, serverSelectionTimeoutMS: 15000, maxPoolSize: 10 })
      .then((m) => m)
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
