import TabbedDashboard from "@/components/TabbedDashboard";

async function getGuests() {
  try {
    console.log("🔄 Fetching guests via API route...");

    // Use caminho relativo para ser agnóstico a dev/prod/reverse-proxy
    const apiUrl = `/api/convidados/list`;
    console.log("🌐 API URL:", apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
      },
      next: { revalidate: 0 },
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

async function getPreselections() {
  try {
    console.log("🔄 Fetching preselections via API route...");

    const apiUrl = `/api/preselecao/list`;
    console.log("🌐 Preselection API URL:", apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
      },
      next: { revalidate: 0 },
    });
    
    if (!response.ok) {
      console.error("❌ Preselection API response not OK:", response.status, response.statusText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error("❌ Preselection API returned error:", data.error);
      throw new Error(data.error || "API returned error");
    }
    
    console.log("✅ Successfully fetched", data.preselections?.length || 0, "preselections via API");
    return data.preselections || [];
    
  } catch (error) {
    console.error("❌ Error fetching preselections via API:", error);
    
    // Fallback: try direct database connection
    try {
      console.log("🔄 Trying direct preselection database fallback...");
      const { prisma } = await import("@/lib/prisma");
      
      const preselections = await prisma.preselection.findMany({
        orderBy: [
          { data_cadastro: 'desc' }, // mais recentes primeiro
        ],
      });
      
      console.log("✅ Preselection fallback successful, fetched", preselections.length, "preselections");
      return preselections;
      
    } catch (fallbackError) {
      console.error("❌ Preselection fallback also failed:", fallbackError);
      return [];
    }
  }
}

export default async function Home() {
  console.log("🏠 Loading Home page...");
  
  const [guests, preselections] = await Promise.all([
    getGuests(),
    getPreselections()
  ]);
  
  console.log("📋 Passing", guests.length, "guests and", preselections.length, "preselections to TabbedDashboard");

  return <TabbedDashboard guests={guests} preselections={preselections} />;
}
