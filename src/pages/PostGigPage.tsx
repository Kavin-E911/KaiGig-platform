import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2, Type, FileText as DescIcon, Tag, IndianRupee, CalendarDays, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createGig } from "@/services/gigService";
import { useToast } from "@/hooks/use-toast";

const PostGigPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !budget || !deadline) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createGig({
        title,
        description,
        category,
        budget: Number(budget),
        deadline,
        skillsRequired: skills,
        postedBy: user!.uid,
        postedByName: profile ? `${profile.firstName} ${profile.lastName}` : "Anonymous",
      });
      setPosted(true);
      toast({ title: "Gig posted!", description: "Your gig is now live." });
      setTimeout(() => navigate("/gigs"), 2000);
    } catch (err: any) {
      toast({ title: "Failed to post gig", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (posted) {
    return (
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Gig Posted Successfully!</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Your gig <strong className="text-foreground">{title}</strong> is now live. Redirecting to browse...
          </p>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> New Gig
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Post a New Gig</h1>
        <p className="text-muted-foreground mt-1">Describe what you need help with and find a skilled peer.</p>
      </div>
      <div className="bg-card rounded-2xl border border-border/60 p-8 shadow-[var(--shadow-lg)] animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary" /> Gig Title
            </Label>
            <Input id="title" placeholder="e.g. Design a logo for my college club" value={title} onChange={(e) => setTitle(e.target.value)} className="focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="flex items-center gap-1.5">
              <DescIcon className="w-3.5 h-3.5 text-primary" /> Description
            </Label>
            <Textarea id="desc" placeholder="Describe what you need in detail..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="focus:border-primary/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" /> Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="tutoring">Tutoring</SelectItem>
                  <SelectItem value="video">Video Editing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-primary" /> Budget (₹)
              </Label>
              <Input id="budget" type="number" placeholder="500" value={budget} onChange={(e) => setBudget(e.target.value)} className="focus:border-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-primary" /> Deadline
              </Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-primary" /> Skills Required
              </Label>
              <Input id="skills" placeholder="e.g. Figma, Photoshop" value={skills} onChange={(e) => setSkills(e.target.value)} className="focus:border-primary/50" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-cta text-cta-foreground hover:bg-cta/90 btn-glow text-base gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Post Gig</>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default PostGigPage;
