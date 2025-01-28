import { PrismaClient } from "@prisma/client";
import {isTest} from "@/lib/urlops.server";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

const prisma: PrismaClient = isTest() ? jestPrisma.client : global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;
