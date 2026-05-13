import { prisma } from "./prisma";

export async function generateInvoiceNumber(organizationId: string): Promise<string> {
  const today = new Date();
  const yearMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `INV-${yearMonth}-`;

  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: prefix },
      organizationId,
    },
    orderBy: { invoiceNumber: "desc" },
  });

  let nextSequence = 1;
  if (latestInvoice && latestInvoice.invoiceNumber) {
    const parts = latestInvoice.invoiceNumber.split("-");
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSequence = seq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, "0");
  return `${prefix}${paddedSequence}`;
}
