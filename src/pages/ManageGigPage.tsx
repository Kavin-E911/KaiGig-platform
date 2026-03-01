import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, User, Clock, DollarSign, CheckCircle2, XCircle,
  ExternalLink, FileText, Sparkles, Image, Globe, Package, Trophy, Power, PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getGigById, deactivateGig, reactivateGig, type Gig } from "@/services/gigService";
import {
  getApplicationsForGig,
  acceptApplication,
  rejectApplication,
  acceptDeliverable,
  rejectDeliverable,
  type Application,
  type AppStatus,
} from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";

const ManageGigPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [gigData, apps] = await Promise.all([
        getGigById(id),
        getApplicationsForGig(id),
      ]);
      setGig(gigData);
      setApplications(apps);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAccept = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await acceptApplication(app);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "accepted" as AppStatus } : a))
      );
      toast({ title: "Application Accepted!", description: `${app.applicantName} has been notified to submit their work.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await rejectApplication(app);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "rejected" as AppStatus } : a))
      );
      toast({ title: "Application Rejected", description: `${app.applicantName} has been notified.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveDeliverable = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await acceptDeliverable(app);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "completed" as AppStatus } : a))
      );
      toast({ title: "Work Approved! ✅", description: `${app.applicantName} earned ₹${app.budget}. Task completed!` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDeliverable = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await rejectDeliverable(app);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "rejected" as AppStatus } : a))
      );
      toast({ title: "Deliverable Rejected", description: `${app.applicantName} has been notified.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleGig = async () => {
    if (!gig) return;
    try {
      if (gig.active === false) {
        await reactivateGig(gig.id);
        setGig({ ...gig, active: true });
        toast({ title: "Gig Reactivated", description: `"${gig.title}" is now visible to applicants.` });
      } else {
        await deactivateGig(gig.id);
        setGig({ ...gig, active: false });
        toast({ title: "Gig Deactivated", description: `"${gig.title}" is now hidden from applicants.` });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading || authLoading) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading gig details...</p>
        </div>
      </main>
    );
  }

  if (!gig) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Gig not found.</p>
          <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
      </main>
    );
  }

  const pending = applications.filter((a) => a.status === "pending");
  const accepted = applications.filter((a) => a.status === "accepted");
  const delivered = applications.filter((a) => a.status === "delivered");
  const completed = applications.filter((a) => a.status === "completed");
  const rejected = applications.filter((a) => a.status === "rejected");
  const skills = gig.skillsRequired ? gig.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        to="/my-gigs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to My Gigs
      </Link>

      {/* Gig summary card */}
      <div className={`bg-card rounded-2xl border p-6 shadow-[var(--shadow-lg)] mb-8 animate-fade-in ${
        gig.active === false ? "border-destructive/30" : "border-border/60"
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">{gig.category}</span>
          {gig.active === false && (
            <span className="px-3 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">Inactive</span>
          )}
          <span className="text-xs text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-card-foreground mb-2">{gig.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{gig.description}</p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground font-medium">{s}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6 text-sm pt-3 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-success font-semibold"><DollarSign className="w-4 h-4" />₹{gig.budget}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-4 h-4" />{gig.deadline}</span>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 ${
                gig.active === false
                  ? "text-success hover:text-success hover:bg-success/10"
                  : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
              }`}
              onClick={handleToggleGig}
            >
              {gig.active === false ? (
                <><Power className="w-4 h-4" /> Reactivate Gig</>
              ) : (
                <><PowerOff className="w-4 h-4" /> Deactivate Gig</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Applications grouped by status */}
      <div className="space-y-8">
        {/* Deliverables to Review */}
        {delivered.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" /> Deliverables to Review ({delivered.length})
            </h2>
            <div className="space-y-3">
              {delivered.map((app, i) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  index={i}
                  actionLoading={actionLoading}
                  onApproveDeliverable={handleApproveDeliverable}
                  onRejectDeliverable={handleRejectDeliverable}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warning" /> Pending ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((app, i) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  index={i}
                  actionLoading={actionLoading}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted — awaiting deliverable */}
        {accepted.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Awaiting Deliverable ({accepted.length})
            </h2>
            <div className="space-y-3">
              {accepted.map((app, i) => (
                <ApplicationCard key={app.id} app={app} index={i} actionLoading={null} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-success" /> Completed ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map((app, i) => (
                <ApplicationCard key={app.id} app={app} index={i} actionLoading={null} />
              ))}
            </div>
          </div>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" /> Rejected ({rejected.length})
            </h2>
            <div className="space-y-3">
              {rejected.map((app, i) => (
                <ApplicationCard key={app.id} app={app} index={i} actionLoading={null} />
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No one has applied to this gig yet.</p>
          </div>
        )}
      </div>
    </main>
  );
};

// ---- Application Card Component ----
function ApplicationCard({
  app,
  index,
  actionLoading,
  onAccept,
  onReject,
  onApproveDeliverable,
  onRejectDeliverable,
}: {
  app: Application;
  index: number;
  actionLoading: string | null;
  onAccept?: (app: Application) => void;
  onReject?: (app: Application) => void;
  onApproveDeliverable?: (app: Application) => void;
  onRejectDeliverable?: (app: Application) => void;
}) {
  const dateStr = app.appliedAt
    ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const deliveredDateStr = app.deliveredAt
    ? new Date(app.deliveredAt.seconds * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  const completedDateStr = app.completedAt
    ? new Date(app.completedAt.seconds * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  const statusBadge: Record<string, string> = {
    pending: "bg-warning/15 text-warning border-warning/20",
    accepted: "bg-primary/15 text-primary border-primary/20",
    delivered: "bg-accent/15 text-accent border-accent/20",
    completed: "bg-success/15 text-success border-success/20",
    rejected: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const statusLabel: Record<string, string> = {
    pending: "Pending",
    accepted: "Awaiting Work",
    delivered: "Review Required",
    completed: "Completed",
    rejected: "Rejected",
  };

  const deliverableIcons: Record<string, typeof Image> = {
    image: Image,
    link: Globe,
    notes: FileText,
  };

  return (
    <div
      className="bg-card rounded-xl border border-border/60 p-5 shadow-[var(--shadow-sm)] hover:border-primary/20 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-card-foreground">{app.applicantName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge[app.status] || statusBadge.pending}`}>
              {statusLabel[app.status] || app.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{app.pitch}</p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>Applied {dateStr}</span>
            {app.estimatedTime && <span>⏱ {app.estimatedTime}</span>}
            {app.portfolioLink && (
              <a
                href={app.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Portfolio <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Deliverable preview — shown for delivered & completed statuses */}
      {(app.status === "delivered" || app.status === "completed") && app.deliverableType && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2">
            {(() => {
              const DIcon = deliverableIcons[app.deliverableType] || FileText;
              return <DIcon className="w-4 h-4 text-accent" />;
            })()}
            <span className="text-sm font-semibold text-card-foreground">
              Submitted {app.deliverableType === "image" ? "Image" : app.deliverableType === "link" ? "Link" : "Notes"}
            </span>
            {deliveredDateStr && <span className="text-xs text-muted-foreground ml-auto">{deliveredDateStr}</span>}
          </div>

          {/* Image preview */}
          {app.deliverableType === "image" && app.deliverableUrl && (
            <div className="rounded-lg overflow-hidden border border-border/40 mb-2">
              <img
                src={app.deliverableUrl}
                alt="Deliverable"
                className="w-full max-h-64 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <a
                href={app.deliverableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-xs text-primary hover:underline flex items-center gap-1"
              >
                Open full image <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Link preview */}
          {app.deliverableType === "link" && app.deliverableUrl && (
            <a
              href={app.deliverableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary/60 border border-border/40 text-sm text-primary hover:bg-secondary transition-colors mb-2"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate">{app.deliverableUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-auto" />
            </a>
          )}

          {/* Notes preview */}
          {app.deliverableNotes && (
            <div className="px-4 py-3 rounded-lg bg-secondary/40 border border-border/40 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {app.deliverableNotes}
            </div>
          )}
        </div>
      )}

      {/* Completed info */}
      {app.status === "completed" && completedDateStr && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2 text-xs">
          <Trophy className="w-3.5 h-3.5 text-success" />
          <span className="text-success font-semibold">Completed on {completedDateStr}</span>
          <span className="text-success font-bold ml-auto">₹{app.budget} earned</span>
        </div>
      )}

      {/* Pending → Accept/Reject buttons */}
      {app.status === "pending" && onAccept && onReject && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
          <Button
            size="sm"
            className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
            disabled={actionLoading === app.id}
            onClick={() => onAccept(app)}
          >
            {actionLoading === app.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={actionLoading === app.id}
            onClick={() => onReject(app)}
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </Button>
        </div>
      )}

      {/* Delivered → Approve/Reject deliverable buttons */}
      {app.status === "delivered" && onApproveDeliverable && onRejectDeliverable && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
          <Button
            size="sm"
            className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
            disabled={actionLoading === app.id}
            onClick={() => onApproveDeliverable(app)}
          >
            {actionLoading === app.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trophy className="w-3.5 h-3.5" />
            )}
            Approve & Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={actionLoading === app.id}
            onClick={() => onRejectDeliverable(app)}
          >
            <XCircle className="w-3.5 h-3.5" /> Reject Work
          </Button>
        </div>
      )}
    </div>
  );
}

export default ManageGigPage;
