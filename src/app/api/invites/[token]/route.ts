import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: { organization: { select: { name: true, id: true } } },
    });

    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status === "ACCEPTED") return NextResponse.json({ error: "Invite already accepted" }, { status: 410 });
    if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
      await prisma.organizationInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    return NextResponse.json({
      token: invite.token,
      email: invite.email,
      role: invite.role,
      orgName: invite.organization.name,
      orgId: invite.organization.id,
      status: invite.status,
    });
  } catch (error) {
    console.error("Failed to resolve invite:", error);
    return NextResponse.json({ error: "Failed to resolve invite" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await params;
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status === "ACCEPTED") return NextResponse.json({ error: "Already accepted" }, { status: 410 });
    if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
      await prisma.organizationInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    if (session.user.email !== invite.email) {
      return NextResponse.json({ error: "This invite is for a different email address" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.organizationMember.create({
        data: { userId: session.user.id, organizationId: invite.organizationId, role: invite.role },
      }),
      prisma.organizationInvite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } }),
    ]);

    return NextResponse.json({ success: true, orgId: invite.organizationId });
  } catch (error) {
    console.error("Failed to accept invite:", error);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
