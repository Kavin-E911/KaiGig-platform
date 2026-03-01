import { ArrowRight, BookOpen, DollarSign, Shield, Users, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

const features = [
  { icon: DollarSign, title: "Earn Pocket Money", desc: "Complete micro-gigs and get paid for skills you already have — no full-time job needed." },
  { icon: BookOpen, title: "Build Your Portfolio", desc: "Every gig is a real project. Stack up work samples and references from real clients." },
  { icon: Shield, title: "Trusted & Verified", desc: "Only verified college students can join. Work with people you can actually trust." },
  { icon: Users, title: "Peer Connections", desc: "Build a network of skilled peers inside your campus for future collaborations." },
  { icon: Sparkles, title: "Skill Discovery", desc: "Discover hidden talents in your campus — from design to coding to tutoring." },
  { icon: Target, title: "Quick Turnaround", desc: "Micro-gigs are small, focused tasks. Post today, get results tomorrow." },
];

const LandingPage = () => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-[0.04]" />
      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" /> By Model Misfits
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              <span className="gradient-text">Pocket Money,</span><br />
              Real Skills, Trusted<br />
              Inside Your College.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              The peer-powered micro-gig marketplace where college students help each other, earn money, and build real-world experience — all within a trusted campus network.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-cta text-cta-foreground hover:bg-cta/90 btn-glow text-base px-8 gap-2 shadow-lg">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/gigs">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Browse Gigs
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-xl)]">
              <img src={heroImage} alt="Students collaborating on micro-gigs" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl gradient-bg opacity-20 animate-float" />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent opacity-20 animate-float" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </div>
    </section>



    {/* Features */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Why KaiGig?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to turn your campus skills into real opportunities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-card rounded-xl border border-border/60 p-7 card-lift shadow-[var(--shadow-sm)] animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-card-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="gradient-bg rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(174_62%_47%/0.2),transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Join hundreds of students already making money and building skills on KaiGig.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-cta text-cta-foreground hover:bg-cta/90 text-base px-10 gap-2 shadow-lg">
                Join KaiGig Today <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default LandingPage;
