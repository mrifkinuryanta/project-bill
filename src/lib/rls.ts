import { AsyncLocalStorage } from "async_hooks";

export const rlsContext = new AsyncLocalStorage<{ organizationId: string }>();

export function getOrgContext(): string | undefined {
  return rlsContext.getStore()?.organizationId;
}

const NON_TENANT_MODELS = [
  "Organization",
  "OrganizationMember",
  "OrganizationInvite",
  "User",
  "Subscription",
  "ExportJob",
  "AgentConfig",
  "AgentMessage",
];

export function isTenantModel(model: string | undefined): boolean {
  return !!model && !NON_TENANT_MODELS.includes(model);
}
