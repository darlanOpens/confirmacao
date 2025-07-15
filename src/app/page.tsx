import { PrismaClient } from "@prisma/client";
import GuestPage from "@/components/GuestPage";

const prisma = new PrismaClient();

async function getGuests() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        data_cadastro: "desc",
      },
    });
    return guests;
  } catch {
    console.log("Database not available during build, returning empty list");
    return [];
  }
}

export default async function Home() {
  const guests = await getGuests();

  return <GuestPage guests={guests} />;
}
