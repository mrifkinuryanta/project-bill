import { prisma } from "@/lib/prisma";

export interface AuditLogParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

/**
 * Creates an immutable audit log record for tracking important system events 
 * (financial transactions, SOW signatures, setting changes).
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType ?? undefined,
        entityId: params.entityId ?? undefined,
        field: params.field ?? undefined,
        oldValue: params.oldValue ?? undefined,
        newValue: params.newValue ?? undefined,
      },
    });
  } catch (error) {
    // Failing to write an audit log should ideally not crash the parent transaction
    // but should be heavily alerted on in an APM tool if it fails
    console.error("[AuditLogger] Failed to write audit log:", error);
  }
}
