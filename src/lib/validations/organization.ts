import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url("Invalid URL").optional().nullable(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationValues = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleValues = z.infer<typeof updateMemberRoleSchema>;
