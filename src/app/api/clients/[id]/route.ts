import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const id = resolvedParams.id
        const json = await request.json()
        const { name, email } = json

        const client = await prisma.client.update({
            where: { id },
            data: { name, email }
        })

        return NextResponse.json(client)
    } catch (error) {
        console.error("Failed to update client:", error)
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const id = resolvedParams.id
        await prisma.client.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete client:", error)
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
}
