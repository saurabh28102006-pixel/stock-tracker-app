import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://novatext43_db_user:6FcoHNfIXxfJOhuW@cluster0.tsl6pvn.mongodb.net/tradepulse?retryWrites=true&w=majority&appName=Cluster0';

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (!MONGODB_URI) throw new Error('MONGODB_URI must be set within .env');

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  console.log(`Connected to database ${process.env.NODE_ENV || 'production'}`);

  return cached.conn;
};