import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { SOWDocument } from "@/components/pdf/sow-document";
import React from "react";

// Native Response helps handle streams efficiently
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // Secure the route: although public, verify existence and acceptance
        const project = await prisma.project.findUnique({
            where: { id },
            include: { client: true },
        });

        if (!project) {
            return new Response("Project not found", { status: 404 });
        }

        if (!project.terms) {
            return new Response("This project has no terms", { status: 400 });
        }

        if (!project.termsAcceptedAt) {
            return new Response("Terms have not been accepted yet", { status: 403 });
        }

        // Generate PDF stream
        const stream = await renderToStream(
            <SOWDocument
                projectTitle={project.title}
                clientName={project.client.name}
                terms={project.terms}
                termsAcceptedAt={project.termsAcceptedAt}
                termsAcceptedIp={project.termsAcceptedIp}
                termsVersionId={project.termsVersionId}
            />
        );

        // Return the stream as a PDF response
        return new Response(stream as unknown as ReadableStream, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="SOW_${project.title.replace(/\\s+/g, '_')}.pdf"`,
            },
        });

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        return new Response("Internal Server Error generating PDF", { status: 500 });
    }
}
