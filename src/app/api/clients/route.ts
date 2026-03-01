import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(clients)
    } catch (error) {
        console.error("Failed to sequence clients:", error)
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const { name, email } = json

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const client = await prisma.client.create({
            data: { name, email }
        })

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        console.error("Failed to create client:", error)
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }
}
