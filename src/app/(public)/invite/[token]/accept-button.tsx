"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAccept() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        await update({ activeOrganizationId: data.orgId });
        toast.success("Welcome to the organization!");
        router.push("/");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to accept invitation");
      }
    } catch {
      toast.error("Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleAccept} disabled={isLoading} className="w-full">
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      Accept Invitation
    </Button>
  );
}
