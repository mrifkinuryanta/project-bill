import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AcceptInviteButton } from "./accept-button";

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true, id: true } } },
  });

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>This invite link is invalid or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired. Please ask the organization owner to send a new one.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invite.status === "ACCEPTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Already Joined</CardTitle>
            <CardDescription>You have already accepted this invitation.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>You&apos;ve Been Invited</CardTitle>
            <CardDescription>
              <strong>{invite.organization.name}</strong> has invited you to join as <Badge variant="outline" className="ml-1">{invite.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/login?callbackUrl=/invite/${token}`}>Sign in to Accept</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.user.email !== invite.email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Wrong Account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invite.email}</strong>. You are signed in as <strong>{session.user.email}</strong>. Please sign in with the correct email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle>Join {invite.organization.name}?</CardTitle>
          <CardDescription>
            You have been invited as <Badge variant="outline">{invite.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AcceptInviteButton token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
