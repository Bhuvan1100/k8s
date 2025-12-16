import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:postgres@localhost:5432/authdb"
});

export default prisma;
