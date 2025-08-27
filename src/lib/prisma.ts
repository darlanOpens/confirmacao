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

// Test connection on startup (only in runtime, not build time)
async function testConnection() {
  // Skip connection test during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('🔄 Skipping database connection test during build...')
    return
  }

  try {
    console.log('🔄 Testing Prisma connection...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Prisma connection successful!')
  } catch (error) {
    console.error('❌ Prisma connection failed:', error)
    // Don't throw - let the app try to reconnect later
  }
}

// Test connection only if not in build phase
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  testConnection()
} 