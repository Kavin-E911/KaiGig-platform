import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Loader2, Image, Globe, FileText, Send, CheckCircle2,
  DollarSign, Clock, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getGigById, type Gig } from "@/services/gigService";
import {
  getApplicationsForGig,
  submitDeliverable,
  type Application,
} from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";

type DeliverableType = "image" | "link" | "notes";

const deliverableTypes: { value: DeliverableType; label: string; icon: typeof Image; desc: string }[] = [
  { value: "image", label: "Image / Screenshot", icon: Image, desc: "Upload a design, screenshot, or photo URL" },
  { value: "link", label: "Website / Project Link", icon: Globe, desc: "Share a live website, repo, or project URL" },
  { value: "notes", label: "Written Notes", icon: FileText, desc: "Provide notes, documents, or text content" },
];

const SubmitDeliverablePage = () => {
  const { id: gigId } = useParams(); // gig id from URL
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gig, setGig] = useState<Gig | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState<DeliverableType>("link");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!gigId || !user) return;
    const fetchData = async () => {
      const [gigData, apps] = await Promise.all([
        getGigById(gigId),
        getApplicationsForGig(gigId),
      ]);
      setGig(gigData);
      // Find the current user's accepted application for this gig
      const myApp = apps.find(
        (a) => a.applicantId === user.uid && a.status === "accepted"
      );
      setApplication(myApp || null);
      setLoading(false);
    };
    fetchData();
  }, [gigId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !gig) return;

    if (selectedType === "notes" && !notes.trim()) {
      toast({ title: "Error", description: "Please provide your notes.", variant: "destructive" });
      return;
    }
    if ((selectedType === "image" || selectedType === "link") && !url.trim()) {
      toast({ title: "Error", description: "Please provide a URL.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await submitDeliverable(
        application.id,
        {
          deliverableType: selectedType,
          deliverableUrl: url,
          deliverableNotes: notes,
        },
        application,
        gig.postedBy,
      );
      setSubmitted(true);
      toast({ title: "Deliverable submitted!", description: "The gig poster will review your work." });
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading || authLoading) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // No accepted application found
  if (!gig || !application) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">No accepted application found for this gig.</p>
          <Link to="/my-applications"><Button variant="outline">Back to Applications</Button></Link>
        </div>
      </main>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Work Submitted!</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Your deliverable for <strong className="text-foreground">{gig.title}</strong> has been sent for review. 
            Once approved, you'll earn <strong className="text-success">₹{application.budget}</strong>.
          </p>
          <Link to="/my-applications">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Applications
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <Link
        to="/my-applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Applications
      </Link>

      {/* Gig info */}
      <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-[var(--shadow-lg)] mb-6 animate-fade-in">
        <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">{gig.category}</span>
        <h1 className="font-display text-2xl font-bold text-card-foreground mt-3 mb-2">{gig.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{gig.description}</p>
        <div className="flex items-center gap-6 text-sm pt-3 border-t border-border/40">
          <span className="flex items-center gap-1.5 text-success font-semibold"><DollarSign className="w-4 h-4" />₹{gig.budget}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-4 h-4" />{gig.deadline}</span>
        </div>
      </div>

      {/* Submit form */}
      <div className="bg-card rounded-2xl border border-border/60 p-8 shadow-[var(--shadow-lg)] animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-card-foreground">Submit Your Work</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Upload your completed deliverable for the gig poster to review.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Type selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Deliverable Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {deliverableTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedType(t.value)}
                  className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                    selectedType === t.value
                      ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                      : "border-border/60 hover:border-primary/30 bg-card"
                  }`}
                >
                  <t.icon className={`w-5 h-5 mb-2 ${selectedType === t.value ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-semibold text-card-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* URL field for image/link types */}
          {(selectedType === "image" || selectedType === "link") && (
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                {selectedType === "image" ? "Image URL" : "Project / Website URL"}
              </Label>
              <Input
                id="url"
                placeholder={selectedType === "image" ? "https://i.imgur.com/your-image.png" : "https://your-project.vercel.app"}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {/* Notes field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              {selectedType === "notes" ? "Your Notes / Content" : "Additional Notes (optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                selectedType === "notes"
                  ? "Paste your written content, notes, or documentation here..."
                  : "Any additional context or comments about your submission..."
              }
              rows={selectedType === "notes" ? 8 : 3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-cta text-cta-foreground hover:bg-cta/90 btn-glow text-base gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Deliverable</>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default SubmitDeliverablePage;
