import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                project: {
                    include: { client: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(invoices)
    } catch (error) {
        console.error("Failed to fetch invoices:", error)
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const { projectId, type, amount, dueDate } = json

        if (!projectId || !type || amount === undefined) {
            return NextResponse.json({ error: "Missing required fields: projectId, type, amount" }, { status: 400 })
        }

        const invoice = await prisma.invoice.create({
            data: {
                projectId,
                type,
                amount: parseFloat(amount),
                dueDate: dueDate ? new Date(dueDate) : null,
                status: "unpaid"
            },
            include: { project: true }
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error("Failed to create invoice:", error)
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }
}
