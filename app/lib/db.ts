import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  console.log('[DB] Creating new Prisma client...');
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  client.$connect()
    .then(() => console.log('[DB] Successfully connected to database'))
    .catch(error => console.error('[DB] Failed to connect to database:', error));
    
  return client;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
