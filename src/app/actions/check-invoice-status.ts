"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function checkInvoiceStatus(invoiceId: string) {
    try {
        const session = await auth();
        const where: { id: string; organizationId?: string } = { id: invoiceId };
        if (session?.user?.activeOrganizationId) {
          where.organizationId = session.user.activeOrganizationId;
        }
        const invoice = await prisma.invoice.findFirst({
            where,
            select: { status: true },
        });

        return invoice?.status || null;
    } catch (error) {
        console.error("Failed to check invoice status:", error);
        return null;
    }
}
