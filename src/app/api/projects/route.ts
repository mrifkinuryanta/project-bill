import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const projects = await prisma.project.findMany({
            include: { client: true, invoices: true, items: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(projects)
    } catch (error) {
        console.error("Failed to fetch projects:", error)
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const json = await request.json()
        const { title, clientId, totalPrice, dpAmount, currency, items, deadline } = json

        if (!title || !clientId || totalPrice === undefined) {
            return NextResponse.json({ error: "Missing required fields: title, clientId, totalPrice" }, { status: 400 })
        }

        const parsedTotalPrice = parseFloat(totalPrice)
        const parsedDpAmount = dpAmount ? parseFloat(dpAmount) : null

        if (parsedDpAmount !== null && parsedDpAmount > parsedTotalPrice) {
            return NextResponse.json({ error: "DP amount cannot exceed total price" }, { status: 400 })
        }

        const projectData: any = {
            title,
            clientId,
            totalPrice: parsedTotalPrice,
            dpAmount: parsedDpAmount,
            currency: currency || "IDR",
            deadline: deadline ? new Date(deadline) : null,
            status: "to_do"
        }

        if (items && Array.isArray(items) && items.length > 0) {
            projectData.items = {
                create: items.map((i: any) => ({
                    description: i.description,
                    price: parseFloat(i.price)
                }))
            }
        }

        const project = await prisma.project.create({
            data: projectData,
            include: { client: true, invoices: true, items: true }
        })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error("Failed to create project:", error)
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }
}
