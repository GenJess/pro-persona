import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Hash } from "lucide-react";
import { groups, interests } from "@/data/communityData";
import { useAuth } from "@/contexts/AuthProvider";
import { useEffect } from "react";

const Groups = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !session) navigate("/signin"); }, [session, loading, navigate]);
  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Groups & Interests</h1>
        <p className="text-muted-foreground">Find communities of professionals who care about what you care about.</p>
      </div>

      <div className="mb-10">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4" /> Browse by interest
        </h2>
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => (
            <span key={i} className="text-sm px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/30 hover:text-primary cursor-pointer transition-colors">
              {i}
            </span>
          ))}
        </div>
      </div>

      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" /> Featured groups
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <Card key={g.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{g.members.toLocaleString()} members · {g.tag}</p>
              </div>
              <Button size="sm" variant="outline" className="h-9 shrink-0">Join</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{g.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-3">Don't see a group for your niche?</p>
        <Button variant="outline" asChild><Link to="/feed">Suggest a group</Link></Button>
      </div>
    </div>
  );
};

export default Groups;
