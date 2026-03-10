import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/app/actions/send-invoice";
import { generateInvoiceNumber } from "@/lib/invoice-utils";

export async function GET(request: Request) {
    // 1. Validate CRON_SECRET (Default Deny if not set)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Fetch active recurring invoices that are due to run today or earlier
        const dueTemplates = await prisma.recurringInvoice.findMany({
            where: {
                isActive: true,
                nextRunAt: {
                    lte: today,
                },
            },
            include: {
                project: {
                    include: { client: true },
                },
            },
        });

        let generated = 0;
        const results: { recurringId: string; invoiceId?: string; error?: string }[] = [];

        for (const template of dueTemplates) {
            try {
                // Stop if endDate is passed
                if (template.endDate) {
                    const end = new Date(template.endDate);
                    end.setHours(0, 0, 0, 0);
                    if (today > end) {
                        await prisma.recurringInvoice.update({
                            where: { id: template.id },
                            data: { isActive: false },
                        });
                        results.push({ recurringId: template.id, error: "End date reached, pausing." });
                        continue;
                    }
                }

                // Generate invoice number
                const invoiceNumber = await generateInvoiceNumber();
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7); // Default 7 days, could arguably be made configurable later

                // Create the invoice record
                const newInvoice = await prisma.invoice.create({
                    data: {
                        invoiceNumber,
                        projectId: template.projectId,
                        type: "recurring",
                        notes: template.description || template.title,
                        amount: template.amount,
                        status: "unpaid",
                        dueDate,
                    },
                });

                // Add scoping item just to ensure it looks good if there are no project items or if we want to isolate it
                // We can add the recurring description as a ProjectItem tied to this project temporarily or permanently,
                // but for now, we rely on the Project's existing items. Since it's a "Project", the generated invoice
                // pulls line items from the Project itself when rendered publically.
                // A future enhancement could link RecuringInvoice directly to invoice line items.

                // Send Email automatically
                if (template.project.client.email) {
                    try {
                        await sendInvoiceEmail(newInvoice.id, true, template.description);
                    } catch (err) {
                        console.error(`Failed to send email for auto-invoice ${newInvoice.id}`, err);
                    }
                }

                // Calculate nextRunAt
                let nextRunAt = new Date(template.nextRunAt);
                // Safety check to ensure we jump ahead of today if we somehow missed multiple cycles
                while (nextRunAt <= today) {
                    if (template.frequency === "monthly") {
                        nextRunAt.setMonth(nextRunAt.getMonth() + 1);
                        // Ensure day of month stays as intended where possible
                        // (e.g. Jan 31 -> Feb 28 -> Mar 31) - simplified version here
                        const expectedDay = template.dayOfMonth;
                        nextRunAt.setDate(expectedDay);
                        // if month rolled over unexpectedly, push back to last day of previous month
                        if (nextRunAt.getDate() !== expectedDay) {
                            nextRunAt.setDate(0);
                        }
                    } else if (template.frequency === "weekly") {
                        nextRunAt.setDate(nextRunAt.getDate() + 7);
                    } else if (template.frequency === "yearly") {
                        nextRunAt.setFullYear(nextRunAt.getFullYear() + 1);
                    }
                }

                // Update template
                await prisma.recurringInvoice.update({
                    where: { id: template.id },
                    data: { nextRunAt },
                });

                generated++;
                results.push({ recurringId: template.id, invoiceId: newInvoice.id });
            } catch (templateError) {
                console.error(`Failed to process template ${template.id}:`, templateError);
                results.push({ recurringId: template.id, error: String(templateError) });
            }
        }

        return NextResponse.json({
            success: true,
            processed: dueTemplates.length,
            generated,
            details: results,
        });
    } catch (error) {
        console.error("Cron recurring invoices job failed:", error);
        return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
    }
}
