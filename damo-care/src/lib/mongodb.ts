import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) throw new Error('환경변수 MONGO_URI 또는 MONGODB_URI가 설정되지 않았습니다.');

declare global {
  var mongoose: { conn: typeof import('mongoose') | null; promise: Promise<typeof import('mongoose')> | null };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
      maxPoolSize: 10,        // 연결 풀 최대 10개 유지
      serverSelectionTimeoutMS: 5000,  // 서버 선택 타임아웃 5초
      socketTimeoutMS: 45000,          // 소켓 타임아웃 45초
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
