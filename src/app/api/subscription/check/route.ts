import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkLimit } from "@/lib/subscription";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resource = searchParams.get("resource");

    if (!resource) {
      return new NextResponse("Resource parameter is required", { status: 400 });
    }

    // Validate resource is a key of PLAN_LIMITS (checkLimit handles the exact type, but we pass it as string here)
    // The type `Parameters<typeof checkLimit>[1]` restricts to valid keys.
    // We cast it to any and let checkLimit handle throwing or false if it's somehow invalid.
    // But ideally we just pass it as the correct type.
    const result = await checkLimit(session.user.id, resource as Parameters<typeof checkLimit>[1]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
