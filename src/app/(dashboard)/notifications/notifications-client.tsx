"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { getBrowserLocale } from "@/lib/i18n";
import { Bell, Check, Loader2, Link as LinkIcon, AlertCircle, FileText, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

export function NotificationsClient({
  initialData,
  total,
  initialUnreadCount,
}: {
  initialData: Notification[];
  total: number;
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [currentLocale, setCurrentLocale] = useState(enUS);

  useEffect(() => {
    setCurrentLocale(getBrowserLocale());
  }, []);

  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    `/api/notifications?page=${page}&limit=${limit}`,
    fetcher,
    {
      fallbackData: page === 1 ? {
        data: initialData,
        meta: { total, page: 1, limit, totalPages: Math.ceil(total / limit) },
        unreadCount: initialUnreadCount,
      } : undefined,
      keepPreviousData: true,
    }
  );

  const notifications = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const markAsRead = async (id?: string) => {
    try {
      mutate(
        (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            unreadCount: id ? Math.max(0, currentData.unreadCount - 1) : 0,
            data: currentData.data.map((n) =>
              !id || n.id === id ? { ...n, isRead: true } : n
            ),
          };
        },
        false
      );

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { markAll: true }),
      });

      mutate();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-5 w-5 text-emerald-500" />;
      case "sow_signed":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAsRead()}
          disabled={data?.unreadCount === 0 || isLoading}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12 text-destructive">
              Failed to load history
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium tracking-tight">No notifications yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                When important activities occur, such as a client paying an invoice, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-6 flex flex-col sm:flex-row gap-4 sm:items-start transition-colors",
                    !notification.isRead ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                >
                  <div className="mt-0.5 shrink-0 hidden sm:block">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                          )}
                          {notification.title}
                        </span>
                        {notification.type === "payment" && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900">Payment</Badge>
                        )}
                        {notification.type === "sow_signed" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900">Document</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                        {format(new Date(notification.createdAt), "MMM d, yyyy • h:mm a", { locale: currentLocale })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-3xl">
                      {notification.message}
                    </p>

                    <div className="flex gap-3 pt-3">
                      {notification.linkUrl && (
                        <Button variant="secondary" size="sm" className="h-8 shadow-sm" asChild>
                          <Link href={notification.linkUrl}>
                            <LinkIcon className="h-3.5 w-3.5 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      )}
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-primary"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
