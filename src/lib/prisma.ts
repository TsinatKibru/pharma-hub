import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const basePrisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

export const prisma = basePrisma

/**
 * Creates a tenant-aware Prisma client that automatically filters by tenantId
 * for all relevant models.
 */
export const getTenantPrisma = (tenantId: string) => {
  return basePrisma.$extends({
    query: {
      tenant: {
        async findMany({ args, query }) {
          args.where = { ...args.where, id: tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, id: tenantId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, id: tenantId }
          return query(args)
        },
      },
      inventory: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
      },
      sale: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
      },
      stockMovement: {
        async findMany({ args, query }) {
          args.where = { ...args.where, inventory: { tenantId } }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, inventory: { tenantId } }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, inventory: { tenantId } }
          return query(args)
        },
      }
    }
  })
}
