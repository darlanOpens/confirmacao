import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test connection on startup
async function testConnection() {
  try {
    console.log('🔄 Testing Prisma connection...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Prisma connection successful!')
  } catch (error) {
    console.error('❌ Prisma connection failed:', error)
    // Don't throw - let the app try to reconnect later
  }
}

// Test connection immediately
testConnection() 