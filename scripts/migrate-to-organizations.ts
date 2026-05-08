import "dotenv/config";
import { prisma } from "../src/lib/prisma";

function randomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  console.log("Starting organization data migration...");
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    const orgName = (user.name) || "My Workspace";
    const org = await prisma.organization.create({
      data: { name: orgName, slug: randomSlug() },
    });

    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: org.id, role: "OWNER" },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { defaultOrganizationId: org.id },
    });

    await prisma.client.updateMany({ data: { organizationId: org.id } });
    await prisma.project.updateMany({ data: { organizationId: org.id } });
    await prisma.projectItem.updateMany({ data: { organizationId: org.id } });
    await prisma.invoice.updateMany({ data: { organizationId: org.id } });
    await prisma.sOWTemplate.updateMany({ data: { organizationId: org.id } });
    await prisma.recurringInvoice.updateMany({ data: { organizationId: org.id } });
    await prisma.notification.updateMany({ data: { organizationId: org.id } });
    await prisma.auditLog.updateMany({ data: { organizationId: org.id } });
    await prisma.agentConversation.updateMany({ data: { organizationId: org.id } });
    await prisma.agentMemory.updateMany({ data: { organizationId: org.id } });

    const settings = await prisma.settings.findFirst();
    if (settings) {
      await prisma.settings.updateMany({ data: { organizationId: org.id } });
    }

    console.log(`Migrated user ${user.email} -> org ${org.name}`);
  }

  console.log("\nMigration complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
