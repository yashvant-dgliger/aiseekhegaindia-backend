import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@aiseekhegaindia.local";
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      displayName: "Admin",
      role: Role.admin,
    },
  });

  await prisma.cohort.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { isActive: true },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Lex AI Fellowship — Cohort 1",
      startsOn: new Date("2026-09-01"),
      endsOn: new Date("2026-12-15"),
      isActive: true,
    },
  });

  console.log("Seeded admin@aiseekhegaindia.local / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
