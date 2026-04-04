import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPoolFromDatabaseUrl(connectionString: string) {
  const url = new URL(connectionString.trim())
  const database = url.pathname.replace(/^\/+/, "").trim()

  if (!database) {
    throw new Error("DATABASE_URL does not include a database name")
  }

  return new pg.Pool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    ssl: { rejectUnauthorized: false },
  })
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim()

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  const pool = createPoolFromDatabaseUrl(connectionString)
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
