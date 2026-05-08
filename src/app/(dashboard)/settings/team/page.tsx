import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-2">
          Manage team members and their roles in this organization.
        </p>
      </div>

      <TeamClient orgId={session.user.activeOrganizationId!} />
    </div>
  );
}
