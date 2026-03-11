import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/app/actions/send-invoice";
import { auth } from "@/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
         project: {
            include: { client: true }
         }
      }
    });

    if (!invoice) {
       return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.project.client.email) {
       return NextResponse.json({ error: "Client has no email" }, { status: 400 });
    }

    const res = await sendInvoiceEmail(id);

    if (res.success) {
       return NextResponse.json({ success: true, manual: res.manual });
    } else {
       return NextResponse.json({ error: res.error }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Retry Email API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
