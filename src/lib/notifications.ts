import { prisma } from "@/lib/prisma";

export type NotificationType = "payment" | "sow_signed" | "system";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
}

export async function createNotification({
  title,
  message,
  type,
  linkUrl,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        linkUrl,
      },
    });
    return notification;
  } catch (error) {
    console.error("[NOTIFICATIONS] Error creating notification:", error);
    // We don't want a notification failure to break the main flow (e.g. webhook)
    return null;
  }
}
