import { prisma } from "@/lib/prisma";

interface Guest {
  id: number;
  nome: string;
  email: string;
  data_cadastro: Date;
}

interface ErrorInfo {
  message: string;
  code: unknown;
  name: string;
}

interface DebugInfo {
  timestamp: string;
  environment: string | undefined;
  databaseUrl: string;
  databaseUrlValue: string;
  connectionTest?: string;
  guestTableExists?: string;
  guestCount?: number;
  latestGuest?: Guest | string;
  error?: ErrorInfo;
}

async function debugInfo() {
  const info: DebugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌',
    databaseUrlValue: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/password=[^@]+/, 'password=***') : 'undefined',
  };

  try {
    console.log("🔍 Debug: Testing database connection...");
    
    // Add delay to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test basic connection with retry
    let retries = 3;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await prisma.$queryRaw`SELECT 1 as test`;
        connected = true;
        info.connectionTest = 'Success ✅';
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`Retrying connection... ${retries} attempts left`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }
    
    // Test table existence
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Guest'
    `;
    info.guestTableExists = Array.isArray(tableCheck) && tableCheck.length > 0 ? 'Exists ✅' : 'Missing ❌';
    
    // Count guests
    const count = await prisma.guest.count();
    info.guestCount = count;
    
    // Get sample guest
    const sampleGuest = await prisma.guest.findFirst({
      orderBy: { data_cadastro: 'desc' }
    });
    info.latestGuest = sampleGuest ? {
      id: sampleGuest.id,
      nome: sampleGuest.nome,
      email: sampleGuest.email || 'N/A',
      data_cadastro: sampleGuest.data_cadastro
    } : 'No guests found';
    
  } catch (error) {
    info.connectionTest = 'Failed ❌';
    info.error = {
      message: error instanceof Error ? error.message : String(error),
      code: error && typeof error === 'object' && 'code' in error ? error.code : 'unknown',
      name: error instanceof Error ? error.name : 'unknown'
    };
  }
  
  return info;
}

export default async function DebugPage() {
  const info = await debugInfo();
  
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>🔍 Database Debug Information</h1>
      
      <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Environment</h2>
        <p><strong>Timestamp:</strong> {info.timestamp}</p>
        <p><strong>Node Environment:</strong> {info.environment}</p>
        <p><strong>Database URL:</strong> {info.databaseUrl}</p>
        <p><strong>Database URL Value:</strong> <code>{info.databaseUrlValue}</code></p>
      </div>
      
      <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Database Tests</h2>
        <p><strong>Connection Test:</strong> {info.connectionTest}</p>
        <p><strong>Guest Table:</strong> {info.guestTableExists}</p>
        {typeof info.guestCount === 'number' && (
          <p><strong>Guest Count:</strong> {info.guestCount}</p>
        )}
      </div>
      
      {info.latestGuest && typeof info.latestGuest === 'object' && (
        <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
          <h2>Latest Guest</h2>
          <pre>{JSON.stringify(info.latestGuest, null, 2)}</pre>
        </div>
      )}
      
      {info.error && (
        <div style={{ backgroundColor: '#4a1a1a', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
          <h2>❌ Error Details</h2>
          <pre>{JSON.stringify(info.error, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#1a4a1a', borderRadius: '8px' }}>
        <p><strong>Instructions:</strong></p>
        <p>1. Share this debug information to identify the issue</p>
        <p>2. Check the server logs for additional console output</p>
        <p>3. If connection fails, verify DATABASE_URL configuration</p>
      </div>
    </div>
  );
}