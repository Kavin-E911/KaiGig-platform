import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, GraduationCap, Edit, Save, X, Loader2,
  Briefcase, CheckCircle, DollarSign, Calendar, TrendingUp,
  Clock, Star, Award, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/userService";
import { getGigsByUser } from "@/services/gigService";
import { getMyApplications, type Application } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Edit state
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [college, setCollege] = useState("");
  const [bio, setBio] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [saving, setSaving] = useState(false);

  // Stats
  const [gigsPosted, setGigsPosted] = useState(0);
  const [totalApplied, setTotalApplied] = useState(0);
  const [completedGigs, setCompletedGigs] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [recentCompleted, setRecentCompleted] = useState<Application[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setCollege(profile.college);
      setBio(profile.bio || "");
      setSkillsStr((profile.skills || []).join(", "));
    }
  }, [profile]);

  // Fetch stats
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const [gigs, apps] = await Promise.all([
          getGigsByUser(user.uid),
          getMyApplications(user.uid),
        ]);
        setGigsPosted(gigs.length);
        setTotalApplied(apps.length);
        const done = apps.filter((a) => a.status === "completed");
        setCompletedGigs(done.length);
        setTotalEarned(done.reduce((sum, a) => sum + (a.budget || 0), 0));
        setRecentCompleted(done.sort((a, b) => {
          const at = (a.completedAt as any)?.seconds ?? 0;
          const bt = (b.completedAt as any)?.seconds ?? 0;
          return bt - at;
        }).slice(0, 3));
      } catch { /* ignore */ }
      setStatsLoading(false);
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        firstName,
        lastName,
        college,
        bio,
        skills: skillsStr.split(",").map((s) => s.trim()).filter(Boolean),
      });
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setCollege(profile.college);
      setBio(profile.bio || "");
      setSkillsStr((profile.skills || []).join(", "));
    }
    setEditing(false);
  };

  if (authLoading || !profile) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const skills = profile.skills || [];
  const memberSince = (profile.createdAt as any)?.seconds
    ? new Date((profile.createdAt as any).seconds * 1000).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Profile Card */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-[var(--shadow-lg)] animate-fade-in">
        {/* Banner */}
        <div className="gradient-bg h-36 md:h-44 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(174_62%_47%/0.3),transparent_70%)]" />
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white/80 text-xs">
            <Calendar className="w-3 h-3" /> Member since {memberSince}
          </div>
        </div>

        <div className="px-6 md:px-8 pb-8">
          {/* Avatar + Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14">
            <div className="w-28 h-28 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center text-4xl font-display font-bold text-primary shadow-xl ring-2 ring-primary/20">
              {initials}
            </div>
            <div className="flex-1 pt-2 min-w-0">
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="w-40" />
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="w-40" />
                </div>
              ) : (
                <h1 className="font-display text-2xl md:text-3xl font-bold text-card-foreground">{profile.firstName} {profile.lastName}</h1>
              )}
              {editing ? (
                <Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="College name" className="mt-2 w-72 max-w-full" />
              ) : (
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" /> {profile.college}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-muted-foreground/70" /> {profile.email}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 self-start sm:self-auto shrink-0">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { icon: Briefcase, label: "Gigs Posted", value: gigsPosted, color: "text-primary", bg: "bg-primary/10" },
              { icon: TrendingUp, label: "Applied", value: totalApplied, color: "text-accent", bg: "bg-accent/10" },
              { icon: CheckCircle, label: "Completed", value: completedGigs, color: "text-success", bg: "bg-success/10" },
              { icon: DollarSign, label: "Earned", value: `₹${totalEarned}`, color: "text-cta", bg: "bg-cta/10" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 p-4 bg-secondary/30">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div className="font-display font-bold text-xl text-card-foreground">
                  {statsLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* About Section */}
        <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-[var(--shadow-sm)] animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <h2 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> About
          </h2>
          {editing ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tell others about yourself</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I'm a design student passionate about UI/UX..." rows={5} className="resize-none" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio || "No bio yet. Click Edit Profile to add one!"}
            </p>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-[var(--shadow-sm)] animate-fade-in-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
          <h2 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" /> Skills
          </h2>
          {editing ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Comma-separated skills</Label>
              <Input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="React, Figma, Python, Writing..." />
              <p className="text-xs text-muted-foreground">Tip: Add skills that match popular gig categories.</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full px-3.5 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors">
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet. Click Edit Profile to add some!</p>
          )}
        </div>
      </div>

      {/* Recent Completed Gigs */}
      {recentCompleted.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-[var(--shadow-sm)] mt-6 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-card-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> Recent Completions
            </h2>
            <Link to="/my-applications" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCompleted.map((app) => {
              const completedDate = (app.completedAt as any)?.seconds
                ? new Date((app.completedAt as any).seconds * 1000)
                : null;
              return (
                <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{app.gigTitle}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {completedDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {completedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success shrink-0">+₹{app.budget}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
