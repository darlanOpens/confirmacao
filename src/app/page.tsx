import GuestPage from "@/components/GuestPage";
import { prisma } from "@/lib/prisma";

async function getGuests() {
  try {
    console.log("🔄 Connecting to database...");
    console.log("📊 DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
    
    const guests = await prisma.guest.findMany({
      orderBy: {
        data_cadastro: "desc",
      },
    });
    
    console.log("✅ Successfully fetched", guests.length, "guests from database");
    return guests;
    
  } catch (error) {
    console.error("❌ Database error in page.tsx:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code: error && typeof error === 'object' && 'code' in error ? error.code : 'unknown',
      name: error instanceof Error ? error.name : 'unknown'
    });
    
    // Retorna lista vazia mas com erro logado
    return [];
  }
}

export default async function Home() {
  console.log("🏠 Loading Home page...");
  const guests = await getGuests();
  console.log("📋 Passing", guests.length, "guests to GuestPage component");

  return <GuestPage guests={guests} />;
}
