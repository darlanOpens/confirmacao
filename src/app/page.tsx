import { PrismaClient } from "@prisma/client";
import GuestPage from "@/components/GuestPage";

const prisma = new PrismaClient();

async function getGuests() {
  const guests = await prisma.guest.findMany({
    orderBy: {
      data_cadastro: "desc",
    },
  });
  return guests;
}

export default async function Home() {
  const guests = await getGuests();

  return <GuestPage guests={guests} />;
}
