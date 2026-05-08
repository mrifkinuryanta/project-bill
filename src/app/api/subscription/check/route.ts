import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkOrgLimit } from "@/lib/billing/subscription";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orgId = session.user.activeOrganizationId!;

    const { searchParams } = new URL(req.url);
    const resource = searchParams.get("resource");

    if (!resource) {
      return new NextResponse("Resource parameter is required", { status: 400 });
    }

    // Validate resource is a valid PLAN_LIMITS key
    const { PLAN_LIMITS } = await import("@/lib/billing/subscription");
    if (!(resource in PLAN_LIMITS.starter)) {
      return new NextResponse("Invalid resource", { status: 400 });
    }

    const result = await checkOrgLimit(orgId, resource as Parameters<typeof checkOrgLimit>[1]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
