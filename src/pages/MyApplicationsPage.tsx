import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle, Clock, XCircle, Loader2, FileText, Eye, ExternalLink,
  DollarSign, Trophy, Upload, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMyApplications, type Application, type AppStatus } from "@/services/applicationService";

const statusConfig: Record<AppStatus, { icon: typeof Clock; label: string; class: string }> = {
  pending: { icon: Clock, label: "Pending", class: "bg-warning/10 text-warning border-warning/20" },
  accepted: { icon: Upload, label: "Upload Work", class: "bg-primary/10 text-primary border-primary/20" },
  delivered: { icon: Package, label: "Under Review", class: "bg-accent/10 text-accent border-accent/20" },
  completed: { icon: Trophy, label: "Completed", class: "bg-success/10 text-success border-success/20" },
  rejected: { icon: XCircle, label: "Rejected", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

const MyApplicationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchApps = async () => {
      const data = await getMyApplications(user.uid);
      setApplications(data);
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  if (loading || authLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </main>
    );
  }

  const pending = applications.filter((a) => a.status === "pending").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const delivered = applications.filter((a) => a.status === "delivered").length;
  const completedApps = applications.filter((a) => a.status === "completed");
  const completedCount = completedApps.length;
  const totalEarned = completedApps.reduce((s, a) => s + (a.budget || 0), 0);

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of your gig applications.</p>
      </div>

      {/* Summary bar */}
      {applications.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6 animate-fade-in">
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">{applications.length}</strong> total
          </span>
          <span className="text-sm text-warning">
            <strong>{pending}</strong> pending
          </span>
          {accepted > 0 && (
            <span className="text-sm text-primary">
              <strong>{accepted}</strong> upload needed
            </span>
          )}
          {delivered > 0 && (
            <span className="text-sm text-accent">
              <strong>{delivered}</strong> under review
            </span>
          )}
          <span className="text-sm text-success">
            <strong>{completedCount}</strong> completed
          </span>
          {totalEarned > 0 && (
            <span className="text-sm text-cta font-semibold">
              <strong>₹{totalEarned.toLocaleString()}</strong> earned
            </span>
          )}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">You haven't applied to any gigs yet.</p>
          <Link to="/gigs">
            <Button className="bg-cta text-cta-foreground hover:bg-cta/90 gap-2">
              <Eye className="w-4 h-4" /> Browse Gigs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => {
            const status = statusConfig[app.status as AppStatus] || statusConfig.pending;
            const dateStr = app.appliedAt
              ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently";

            const completedDateStr = app.completedAt
              ? new Date(app.completedAt.seconds * 1000).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                })
              : null;

            return (
              <div
                key={app.id}
                className="bg-card rounded-xl border border-border/60 p-6 shadow-[var(--shadow-sm)] hover:border-primary/20 hover:shadow-md transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-card-foreground">{app.gigTitle}</h3>
                      <Link to={`/apply/${app.gigId}`} className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">Applied on {dateStr} · Budget: ₹{app.budget}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === "completed" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cta/10 text-cta text-xs font-bold border border-cta/20">
                        <DollarSign className="w-3 h-3" /> +₹{app.budget}
                      </span>
                    )}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.class}`}>
                      <status.icon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Action: Upload deliverable when accepted */}
                {app.status === "accepted" && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link to={`/submit-deliverable/${app.gigId}`}>
                      <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Upload className="w-3.5 h-3.5" /> Submit Your Work
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Info: Under review */}
                {app.status === "delivered" && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-accent">
                    <Package className="w-3.5 h-3.5" />
                    <span>Your work has been submitted and is awaiting review by the gig poster.</span>
                  </div>
                )}

                {/* Completed details with date and earnings */}
                {app.status === "completed" && completedDateStr && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-3 text-xs">
                    <Trophy className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-semibold">Completed on {completedDateStr}</span>
                    <span className="text-success font-bold ml-auto">₹{app.budget} earned</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyApplicationsPage;
