import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bell, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";
import { employeeLeavesService } from "@/features/leaves/services/employeeLeavesService";
import type { LeaveRequest } from "@/types";
import { formatDate } from "@/lib/utils";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<LeaveRequest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch recent leaves and treat their statuses as notifications
    const fetchNotifications = async () => {
      try {
        const response = await employeeLeavesService.getMyLeaves({ page: 1, page_size: 5 });
        setNotifications(response.results);
        
        // Count unread - we'll just say the first 3 are unread if they exist, or simulate it based on something.
        // Actually, let's just set unread to the number of non-pending ones, up to 3, as a simulation.
        const nonPending = response.results.filter(l => l.status !== "PENDING").length;
        setUnreadCount(Math.min(nonPending || 3, response.results.length));
      } catch {
        // Silently fail for notifications
      }
    };
    fetchNotifications();
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUnreadCount(0); // Mark as read when opened
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case "CANCELLED":
        return <Trash2 className="h-5 w-5 text-slate-400" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationMessage = (leave: LeaveRequest) => {
    switch (leave.status) {
      case "APPROVED":
        return `Your leave request for ${formatDate(leave.start_date)} has been approved.`;
      case "REJECTED":
        return `Your leave request for ${formatDate(leave.start_date)} was rejected.`;
      case "CANCELLED":
        return `You cancelled your leave request for ${formatDate(leave.start_date)}.`;
      default:
        return `You submitted a leave request for ${formatDate(leave.start_date)}. Pending approval.`;
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          className="relative cursor-pointer p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-80 rounded-xl border border-border bg-card shadow-xl animate-fade-in data-[side=bottom]:slide-in-from-top-2"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
            <h3 className="font-heading font-bold text-sm text-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                onClick={() => setUnreadCount(0)}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No new notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex gap-3 p-4 hover:bg-background transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      {getStatusIcon(notif.status)}
                    </div>
                    <div>
                      <p className="text-sm text-foreground leading-snug">
                        {getNotificationMessage(notif)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notif.updated_at || notif.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
