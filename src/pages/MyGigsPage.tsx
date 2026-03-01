import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Loader2, Users, DollarSign, Clock, ArrowRight, PlusCircle, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getGigsByUser, deactivateGig, reactivateGig, type Gig } from "@/services/gigService";
import { getApplicationsForGig } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";

interface GigWithApps extends Gig {
  applicationCount: number;
}

const MyGigsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gigs, setGigs] = useState<GigWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchGigs = async () => {
      const myGigs = await getGigsByUser(user.uid);
      // Fetch application counts in parallel
      const gigsWithApps = await Promise.all(
        myGigs.map(async (gig) => {
          const apps = await getApplicationsForGig(gig.id);
          return { ...gig, applicationCount: apps.length };
        })
      );
      setGigs(gigsWithApps);
      setLoading(false);
    };
    fetchGigs();
  }, [user]);

  const handleToggleActive = async (e: React.MouseEvent, gig: GigWithApps) => {
    e.preventDefault();
    e.stopPropagation();
    setToggling(gig.id);
    try {
      if (gig.active === false) {
        await reactivateGig(gig.id);
        setGigs((prev) => prev.map((g) => (g.id === gig.id ? { ...g, active: true } : g)));
        toast({ title: "Gig Reactivated", description: `"${gig.title}" is now visible to applicants.` });
      } else {
        await deactivateGig(gig.id);
        setGigs((prev) => prev.map((g) => (g.id === gig.id ? { ...g, active: false } : g)));
        toast({ title: "Gig Deactivated", description: `"${gig.title}" is now hidden from applicants.` });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your gigs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Gigs</h1>
          <p className="text-muted-foreground mt-1">Manage gigs you've posted and review applications.</p>
        </div>
        <Link to="/post-gig">
          <Button size="sm" className="bg-cta text-cta-foreground hover:bg-cta/90 gap-1.5">
            <PlusCircle className="w-4 h-4" /> Post Gig
          </Button>
        </Link>
      </div>

      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">You haven't posted any gigs yet.</p>
          <Link to="/post-gig">
            <Button className="bg-cta text-cta-foreground hover:bg-cta/90 gap-2">
              <PlusCircle className="w-4 h-4" /> Post Your First Gig
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {gigs.map((gig, i) => (
            <Link
              key={gig.id}
              to={`/manage-gig/${gig.id}`}
              className={`block bg-card rounded-xl border p-6 shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-200 group animate-fade-in-up ${
                gig.active === false
                  ? "border-border/30 opacity-60"
                  : "border-border/60 hover:border-primary/20"
              }`}
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">{gig.category}</span>
                    {gig.active === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">Inactive</span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors">{gig.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{gig.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-success font-semibold">
                      <DollarSign className="w-3.5 h-3.5" /> ₹{gig.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {gig.deadline}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Users className="w-3.5 h-3.5" /> {gig.applicationCount} application{gig.applicationCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      gig.active === false
                        ? "text-success hover:text-success hover:bg-success/10"
                        : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                    }`}
                    onClick={(e) => handleToggleActive(e, gig)}
                    disabled={toggling === gig.id}
                    title={gig.active === false ? "Reactivate Gig" : "Deactivate Gig"}
                  >
                    {toggling === gig.id ? <Loader2 className="w-4 h-4 animate-spin" /> : gig.active === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </Button>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyGigsPage;
