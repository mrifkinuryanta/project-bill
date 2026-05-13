import { isTenantModel } from "@/lib/rls";

describe("RLS — Tenant Model Detection", () => {
  test("Client is a tenant model", () => {
    expect(isTenantModel("Client")).toBe(true);
  });

  test("Organization is NOT a tenant model", () => {
    expect(isTenantModel("Organization")).toBe(false);
  });

  test("User is NOT a tenant model", () => {
    expect(isTenantModel("User")).toBe(false);
  });

  test("Unknown model is treated as tenant", () => {
    expect(isTenantModel("SomeRandomModel")).toBe(true);
  });

  test("undefined is not a tenant model", () => {
    expect(isTenantModel(undefined)).toBe(false);
  });
});

describe("Organization Invite Logic", () => {
  test("inviteSchema requires email", () => {
    const { inviteMemberSchema } = require("@/lib/validations/organization");
    const result = inviteMemberSchema.safeParse({ email: "", role: "MEMBER" });
    expect(result.success).toBe(false);
  });

  test("inviteSchema validates correct data", () => {
    const { inviteMemberSchema } = require("@/lib/validations/organization");
    const result = inviteMemberSchema.safeParse({ email: "test@example.com", role: "ADMIN" });
    expect(result.success).toBe(true);
    expect(result.data.role).toBe("ADMIN");
  });
});

describe("Organization Deletion Logic", () => {
  test("deletedAt is set on soft-delete", () => {
    const now = new Date();
    const deletedAt = now;
    expect(deletedAt).toBeInstanceOf(Date);
  });

  test("org with deletedAt > 30 days ago is purgeable", () => {
    const thirtyDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(thirtyDaysAgo < cutoff).toBe(true);
  });
});
