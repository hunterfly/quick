import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing rules
  await prisma.approvalRule.deleteMany();

  // Insert default threshold rules per PRD Section 3.3
  await prisma.approvalRule.createMany({
    data: [
      { minAmount: 0, maxAmount: 2999.99, requiredLevels: 0 },
      { minAmount: 3000, maxAmount: 20000, requiredLevels: 1 },
      { minAmount: 20000.01, maxAmount: 999999999, requiredLevels: 2 },
    ],
  });

  console.log("Seeded 3 default approval rules");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
