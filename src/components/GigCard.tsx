import { Clock, DollarSign, User, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface GigCardProps {
  id: string | number;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  postedBy: string;
  skillsRequired?: string;
}

const categoryColors: Record<string, string> = {
  design: "bg-purple-500/15 text-purple-400",
  coding: "bg-blue-500/15 text-blue-400",
  writing: "bg-amber-500/15 text-amber-400",
  tutoring: "bg-green-500/15 text-green-400",
  video: "bg-rose-500/15 text-rose-400",
  other: "bg-primary/15 text-primary",
};

const GigCard = ({ id, title, description, budget, deadline, category, postedBy, skillsRequired }: GigCardProps) => {
  const colorClass = categoryColors[category?.toLowerCase()] || categoryColors.other;
  const skills = skillsRequired ? skillsRequired.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3) : [];

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-[var(--shadow-sm)] flex flex-col gap-4 group hover:border-primary/30 hover:shadow-[var(--shadow-lg)] transition-all duration-300">
      <div className="flex items-start justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{category}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="w-3 h-3" /> {postedBy}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-display font-semibold text-lg text-card-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground font-medium">
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-sm pt-1 border-t border-border/40">
        <span className="flex items-center gap-1 text-success font-semibold">
          <DollarSign className="w-4 h-4" />{budget}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />{deadline}
        </span>
      </div>
      <Link to={`/apply/${id}`}>
        <Button className="w-full bg-cta text-cta-foreground hover:bg-cta/90 transition-all duration-200 gap-2 group-hover:gap-3">
          Apply Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </Link>
    </div>
  );
};

export default GigCard;
