import { Zap, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border/50 pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">KaiGig</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Pocket money, real skills, trusted inside your college. The peer-powered micro-gig marketplace built for students.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/gigs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Gigs</Link>
            <Link to="/post-gig" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Post a Gig</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Connect</h4>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2026 KaiGig — Designed & Developed by <span className="text-accent font-semibold">Model Misfits</span></p>
        <p className="text-xs text-muted-foreground">Built with ❤️ for college students</p>
      </div>
    </div>
  </footer>
);

export default Footer;
