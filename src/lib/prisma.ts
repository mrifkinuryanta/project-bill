import { env } from "./env";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getOrgContext, isTenantModel } from "./rls";

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const baseClient = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = baseClient;

const scopedClient = baseClient.$extends({
  query: {
    $allModels: {
      findUnique({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      findFirst({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      findFirstOrThrow({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      findMany({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      findUniqueOrThrow({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      count({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      update({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      updateMany({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      delete({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      deleteMany({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      create({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).data?.organizationId) {
          (args as any).data = { ...((args as any).data || {}), organizationId: orgId };
        }
        return query(args);
      },
      createMany({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model)) {
          (args as any).data = ((args as any).data || []).map((d: any) => ({
            ...d,
            organizationId: d.organizationId || orgId,
          }));
        }
        return query(args);
      },
      aggregate({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
      groupBy({ model, args, query }) {
        const orgId = getOrgContext();
        if (orgId && isTenantModel(model) && !(args as any).where?.organizationId) {
          (args as any).where = { ...((args as any).where || {}), organizationId: orgId };
        }
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient;

export const prisma = scopedClient;
