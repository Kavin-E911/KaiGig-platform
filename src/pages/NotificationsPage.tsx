import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, CheckCircle, XCircle, FileText, Loader2, CheckCheck, ExternalLink, Package, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "@/services/notificationService";

const typeConfig: Record<string, { icon: typeof FileText; class: string }> = {
  new_application: { icon: FileText, class: "bg-primary/15 text-primary border-primary/20" },
  application_accepted: { icon: CheckCircle, class: "bg-success/15 text-success border-success/20" },
  application_rejected: { icon: XCircle, class: "bg-destructive/15 text-destructive border-destructive/20" },
  deliverable_submitted: { icon: Package, class: "bg-accent/15 text-accent border-accent/20" },
  task_completed: { icon: Trophy, class: "bg-cta/15 text-cta border-cta/20" },
};

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const data = await getNotifications(user.uid);
      setNotifications(data);
      setLoading(false);
      // Auto-mark all unread notifications as read when page loads
      const hasUnread = data.some((n) => !n.read);
      if (hasUnread) {
        await markAllAsRead(user.uid);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    };
    fetch();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (loading || authLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </main>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAllRead}>
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.new_application;
            const Icon = config.icon;
            const dateStr = notif.createdAt
              ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now";

            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-5 flex items-start gap-4 transition-all duration-200 animate-fade-in-up ${
                  notif.read
                    ? "bg-card border-border/40 opacity-70"
                    : "bg-card border-primary/20 glow-border"
                }`}
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.class}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-card-foreground">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                    {(notif.type === "new_application" || notif.type === "deliverable_submitted") && (
                      <Link
                        to={`/manage-gig/${notif.gigId}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Applications <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {notif.type === "application_accepted" && (
                      <Link
                        to={`/submit-deliverable/${notif.gigId}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Submit Work <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {notif.type === "task_completed" && (
                      <Link
                        to="/my-applications"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Earnings <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default NotificationsPage;
