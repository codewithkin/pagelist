import { env } from "@pagelist/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  
  return new PrismaClient({
    adapter,
    log: ["error"], // Only log errors
  });
}

const prisma = createPrismaClient();
export default prisma;
