import { useEffect, useState } from "react";
import { Search, Briefcase, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GigCard from "@/components/GigCard";
import { getAllGigs, type Gig } from "@/services/gigService";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["All", "Design", "Coding", "Writing", "Tutoring", "Video", "Other"];

const ViewGigsPage = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const data = await getAllGigs();
        setGigs(data);
      } catch (err) {
        console.error("Failed to fetch gigs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  const filtered = gigs.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || g.category.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCategory;
  });

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Browse Gigs</h1>
          <p className="text-muted-foreground mt-1">Find the perfect micro-gig that matches your skills.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search gigs..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading gigs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">
            {gigs.length === 0 ? "No gigs posted yet." : "No gigs match your search."}
          </p>
          {user && gigs.length === 0 && (
            <Link to="/post-gig">
              <Button className="bg-cta text-cta-foreground hover:bg-cta/90 btn-glow">Post the First Gig</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} gig{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((gig, i) => (
              <div key={gig.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                <GigCard
                  id={gig.id}
                  title={gig.title}
                  description={gig.description}
                  budget={`₹${gig.budget}`}
                  deadline={gig.deadline}
                  category={gig.category}
                  postedBy={gig.postedByName}
                  skillsRequired={gig.skillsRequired}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default ViewGigsPage;
