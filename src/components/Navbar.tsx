import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, LogOut, Bell, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/services/authService";
import { getUnreadCount } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

const publicLinks = [
  { label: "Home", path: "/" },
  { label: "Gigs", path: "/gigs" },
];

const authLinks = [
  { label: "Home", path: "/" },
  { label: "Gigs", path: "/gigs" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Post Gig", path: "/post-gig" },
  { label: "My Gigs", path: "/my-gigs" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navLinks = user ? authLinks : publicLinks;

  // Poll unread notifications
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount(user.uid);
        setUnread(count);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Kai<span className="text-primary">Gig</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.path
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Notification bell */}
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className={`w-5 h-5 ${unread > 0 ? "text-primary" : "text-muted-foreground"}`} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  {profile ? `${profile.firstName} ${profile.lastName}` : "Profile"}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 border-border/60 text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 btn-glow">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className={`w-5 h-5 ${unread > 0 ? "text-primary" : "text-muted-foreground"}`} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-card animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2 border-t border-border/50 mt-2">
              {user ? (
                <>
                  <Link to="/profile" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Profile</Button>
                  </Link>
                  <Button variant="outline" className="flex-1 gap-1.5" onClick={handleLogout}>
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
