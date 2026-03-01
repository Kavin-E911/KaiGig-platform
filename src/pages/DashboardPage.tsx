import { useEffect, useState } from "react";
import { Briefcase, FileText, PlusCircle, TrendingUp, User, Eye, Loader2, ArrowRight, CheckCircle, DollarSign, Trophy, Calendar, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getGigsByUser } from "@/services/gigService";
import { getMyApplications, type Application } from "@/services/applicationService";
import { clearAllData } from "@/services/clearData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const quickActions = [
  { icon: PlusCircle, label: "Post a Gig", desc: "Create a new micro-gig for peers", path: "/post-gig", color: "bg-primary/10 text-primary" },
  { icon: Eye, label: "Browse Gigs", desc: "Find tasks that match your skills", path: "/gigs", color: "bg-accent/10 text-accent" },
  { icon: FileText, label: "My Applications", desc: "Track your gig applications", path: "/my-applications", color: "bg-cta/10 text-cta" },
  { icon: User, label: "My Profile", desc: "Update your skills & info", path: "/profile", color: "bg-success/10 text-success" },
];

const DashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [gigsPosted, setGigsPosted] = useState(0);
  const [applied, setApplied] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [earned, setEarned] = useState(0);
  const [completedApps, setCompletedApps] = useState<Application[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const handleClearData = async () => {
    if (!window.confirm("Are you sure you want to delete ALL data (gigs, applications, notifications, users)? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearAllData();
      toast({ title: "Data Cleared", description: "All Firestore data has been deleted." });
      window.location.reload();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const [gigs, apps] = await Promise.all([
          getGigsByUser(user.uid),
          getMyApplications(user.uid),
        ]);
        setGigsPosted(gigs.length);
        setApplied(apps.length);
        // Only "completed" status counts — not just "accepted"
        const done = apps.filter((a: Application) => a.status === "completed");
        setCompleted(done.length);
        setEarned(done.reduce((sum: number, a: Application) => sum + (a.budget || 0), 0));
        setCompletedApps(done.slice(0, 5)); // latest 5
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const displayName = profile ? `${profile.firstName}` : "Student";

  const stats = [
    { label: "Gigs Posted", value: String(gigsPosted), icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Applied", value: String(applied), icon: FileText, color: "bg-accent/10 text-accent" },
    { label: "Completed", value: String(completed), icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Earned", value: `₹${earned.toLocaleString()}`, icon: DollarSign, color: "bg-cta/10 text-cta" },
  ];

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-10 animate-fade-in">
        <p className="text-sm text-muted-foreground mb-1">Dashboard</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Welcome back, {displayName}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening on your KAI marketplace.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
            onClick={handleClearData}
            disabled={clearing}
          >
            {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-card rounded-xl border border-border/60 p-5 shadow-[var(--shadow-sm)] hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-card-foreground">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Completions */}
      {!statsLoading && completedApps.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-5 text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-success" /> Recent Completions
          </h2>
          <div className="space-y-3">
            {completedApps.map((app, i) => {
              const completedDate = app.completedAt
                ? new Date(app.completedAt.seconds * 1000)
                : null;
              const dateStr = completedDate
                ? completedDate.toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : "—";
              const timeStr = completedDate
                ? completedDate.toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={app.id}
                  className="bg-card rounded-xl border border-border/60 p-4 shadow-[var(--shadow-sm)] flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06 + 0.4}s`, opacity: 0 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-card-foreground truncate">{app.gigTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
                      {timeStr && <span>{timeStr}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success shrink-0">+₹{app.budget}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <h2 className="font-display text-xl font-semibold mb-5 text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <Link
            key={a.label}
            to={a.path}
            className="bg-card rounded-xl border border-border/60 p-6 shadow-[var(--shadow-sm)] group hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08 + 0.3}s`, opacity: 0 }}
          >
            <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <a.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-card-foreground mb-1 flex items-center gap-1.5">
              {a.label}
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </h3>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default DashboardPage;
