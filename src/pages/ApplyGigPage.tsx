import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, DollarSign, ArrowLeft, User, Loader2, CheckCircle2, Send, Link2, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getGigById, type Gig } from "@/services/gigService";
import { applyToGig } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";

const ApplyGigPage = () => {
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loadingGig, setLoadingGig] = useState(true);
  const [pitch, setPitch] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchGig = async () => {
      const data = await getGigById(id);
      setGig(data);
      setLoadingGig(false);
    };
    fetchGig();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch) {
      toast({ title: "Error", description: "Please explain why you're a great fit.", variant: "destructive" });
      return;
    }
    if (!gig || !user) return;
    setSubmitting(true);
    try {
      await applyToGig({
        gigId: gig.id,
        gigTitle: gig.title,
        applicantId: user.uid,
        applicantName: profile ? `${profile.firstName} ${profile.lastName}` : "Anonymous",
        pitch,
        portfolioLink: portfolio,
        estimatedTime: timeline,
        budget: gig.budget,
        gigPosterId: gig.postedBy,
      });
      setSubmitted(true);
      toast({ title: "Application submitted!", description: "Good luck!" });
      setTimeout(() => navigate("/my-applications"), 2000);
    } catch (err: any) {
      toast({ title: "Failed to apply", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Loading skeleton ----
  if (loadingGig) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading gig details...</p>
        </div>
      </main>
    );
  }

  // ---- Not found ----
  if (!gig) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Gig not found.</p>
          <Link to="/gigs"><Button variant="outline">Browse Gigs</Button></Link>
        </div>
      </main>
    );
  }

  // ---- Success screen ----
  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Application Submitted!</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Your application for <strong className="text-foreground">{gig.title}</strong> has been sent. Redirecting to your applications...
          </p>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </main>
    );
  }

  const skills = gig.skillsRequired ? gig.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <Link to="/gigs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Gigs
      </Link>

      {/* Gig details card */}
      <div className="bg-card rounded-2xl border border-border/60 p-8 shadow-[var(--shadow-lg)] mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{gig.category}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="w-3 h-3" /> {gig.postedByName}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-card-foreground mb-2">{gig.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{gig.description}</p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground font-medium">{s}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6 text-sm pt-4 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-success font-semibold"><DollarSign className="w-4 h-4" />₹{gig.budget}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-4 h-4" />{gig.deadline}</span>
        </div>
      </div>

      {/* Application form */}
      <div className="bg-card rounded-2xl border border-border/60 p-8 shadow-[var(--shadow-lg)] animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <h2 className="font-display text-xl font-semibold mb-1 text-card-foreground">Apply for this Gig</h2>
        <p className="text-sm text-muted-foreground mb-6">Tell the poster why you're the perfect match.</p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pitch" className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-primary" /> Why are you a great fit?
            </Label>
            <Textarea id="pitch" placeholder="Share your experience, enthusiasm, and approach..." rows={4} value={pitch} onChange={(e) => setPitch(e.target.value)} className="focus:border-primary/50 transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-primary" /> Portfolio / Work Link
            </Label>
            <Input id="portfolio" placeholder="https://your-portfolio.com" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline" className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-primary" /> Estimated Completion Time
            </Label>
            <Input id="timeline" placeholder="e.g. 3 days" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-cta text-cta-foreground hover:bg-cta/90 btn-glow text-base gap-2">
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Application</>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ApplyGigPage;
