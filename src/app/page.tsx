import GuestPage from "@/components/GuestPage";
import { headers } from 'next/headers';

async function getGuests() {
  try {
    console.log("🔄 Fetching guests via API route...");
    
    // Get the current host from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const apiUrl = `${protocol}://${host}/api/convidados/list`;
    console.log("🌐 API URL:", apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error("❌ API response not OK:", response.status, response.statusText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error("❌ API returned error:", data.error);
      throw new Error(data.error || "API returned error");
    }
    
    console.log("✅ Successfully fetched", data.guests?.length || 0, "guests via API");
    return data.guests || [];
    
  } catch (error) {
    console.error("❌ Error fetching guests via API:", error);
    
    // Fallback: try direct database connection
    try {
      console.log("🔄 Trying direct database fallback...");
      const { prisma } = await import("@/lib/prisma");
      
      const guests = await prisma.guest.findMany({
        orderBy: {
          data_cadastro: "desc",
        },
      });
      
      console.log("✅ Fallback successful, fetched", guests.length, "guests");
      return guests;
      
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return [];
    }
  }
}

export default async function Home() {
  console.log("🏠 Loading Home page...");
  const guests = await getGuests();
  console.log("📋 Passing", guests.length, "guests to GuestPage component");

  return <GuestPage guests={guests} />;
}
