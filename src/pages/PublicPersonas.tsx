import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2, MessageSquare, Sparkles, Search, Brain, FileText, Mic, Link2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface PublicPersona {
  id: string;
  avatar_url: string | null;
  agent_id: string | null;
  conversation_link: string;
  first_name: string | null;
  last_name: string | null;
  headline?: string;
  tags?: string[];
  training?: { resume: boolean; voice: boolean; projects: number };
  isFeatured?: boolean;
}

const sampleQuestions = [
  "What are you working on right now?",
  "Tell me about your background",
  "Walk me through your most impactful project",
  "How did you get into this field?",
  "What's your design philosophy?",
  "What would you bring to a team?",
];

// Featured mock personas for notable professionals
const featuredPersonas: PublicPersona[] = [
  {
    id: "mock-steve-jobs",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=SJ&backgroundColor=0a0a0a&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Steve",
    last_name: "Jobs",
    headline: "Co-founder, Apple",
    tags: ["Product Vision", "Design Thinking", "Innovation"],
    training: { resume: true, voice: true, projects: 12 },
    isFeatured: true,
  },
  {
    id: "mock-jony-ive",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=JI&backgroundColor=1d4ed8&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Jony",
    last_name: "Ive",
    headline: "Former CDO, Apple · Founder, LoveFrom",
    tags: ["Industrial Design", "Minimalism", "Hardware"],
    training: { resume: true, voice: true, projects: 8 },
    isFeatured: true,
  },
  {
    id: "mock-satya-nadella",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=SN&backgroundColor=16a34a&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Satya",
    last_name: "Nadella",
    headline: "CEO, Microsoft",
    tags: ["Cloud Computing", "AI Strategy", "Leadership"],
    training: { resume: true, voice: false, projects: 6 },
    isFeatured: true,
  },
  {
    id: "mock-lisa-su",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=dc2626&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Lisa",
    last_name: "Su",
    headline: "CEO, AMD",
    tags: ["Semiconductors", "Engineering", "Turnaround Strategy"],
    training: { resume: true, voice: true, projects: 9 },
    isFeatured: true,
  },
  {
    id: "mock-brian-chesky",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=BC&backgroundColor=ea580c&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Brian",
    last_name: "Chesky",
    headline: "Co-founder & CEO, Airbnb",
    tags: ["Product-Led Growth", "Design", "Marketplace"],
    training: { resume: true, voice: true, projects: 7 },
    isFeatured: true,
  },
  {
    id: "mock-jensen-huang",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=JH&backgroundColor=7c3aed&textColor=ffffff",
    agent_id: null,
    conversation_link: "#",
    first_name: "Jensen",
    last_name: "Huang",
    headline: "CEO, NVIDIA",
    tags: ["GPU Computing", "AI Infrastructure", "Deep Learning"],
    training: { resume: true, voice: true, projects: 11 },
    isFeatured: true,
  },
];

const PublicPersonas = () => {
  const [personas, setPersonas] = useState<PublicPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicPersonas = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('personas')
        .select('id, avatar_url, agent_id, user_id')
        .eq('is_public', true);
      
      if (error) {
        console.error("Error fetching public personas:", error);
        toast({ title: "Error", description: "Could not fetch public personas.", variant: "destructive" });
        setPersonas([]);
        setLoading(false);
        return;
      }

      const personasWithAgent = (data || []).filter(p => p.agent_id);
      
      const userIds = personasWithAgent.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const formattedPersonas: PublicPersona[] = personasWithAgent.map((p) => {
        const profile = profileMap.get(p.user_id);
        return {
          id: p.id,
          avatar_url: p.avatar_url,
          agent_id: p.agent_id,
          conversation_link: `https://elevenlabs.io/app/talk-to?agent_id=${p.agent_id}`,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          training: { resume: true, voice: false, projects: 0 },
        };
      });

      setPersonas(formattedPersonas);
      setLoading(false);
    };
    
    fetchPublicPersonas();
  }, [toast]);

  const allPersonas = [...featuredPersonas, ...personas];

  const filteredPersonas = allPersonas.filter(p => {
    if (!searchQuery) return true;
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const headline = (p.headline || '').toLowerCase();
    const tags = (p.tags || []).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || headline.includes(query) || tags.includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in">
          <Users className="h-4 w-4" />
          {allPersonas.length} Professional Agents
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 opacity-0 animate-slide-up stagger-1">
          Discover <span className="gradient-text">Professionals</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in stagger-2">
          Have real conversations with AI agents trained on real people's work, projects, and expertise. Ask them anything — it's like a coffee chat, but always available.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-10 opacity-0 animate-fade-in stagger-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-card border-border/50 text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        </div>
      ) : filteredPersonas.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {searchQuery ? "No agents found" : "No one's sharing their expertise yet"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery 
              ? "Try a different search term." 
              : "Be the first to build a professional agent and let people learn from you."
            }
          </p>
          {!searchQuery && (
            <Button asChild size="lg" className="h-12 px-8">
              <Link to="/signup">Build Your Agent</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona, i) => {
            const randomQ = sampleQuestions[i % sampleQuestions.length];
            const isMock = persona.isFeatured;
            return (
              <Card 
                key={persona.id} 
                className={`group border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 opacity-0 animate-slide-up stagger-${Math.min(i + 1, 6)} ${isMock ? 'relative overflow-hidden' : ''}`}
              >
                {isMock && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium z-10">
                    <Star className="h-3 w-3" />
                    Featured
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/30 transition-all shadow-md">
                      <AvatarImage src={persona.avatar_url ?? undefined} alt="Agent avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-lg font-semibold">
                        {persona.first_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {persona.first_name && persona.last_name 
                          ? `${persona.first_name} ${persona.last_name}` 
                          : "Professional Agent"
                        }
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {persona.headline || "Professional Agent"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 space-y-3">
                  {/* Training badges */}
                  {persona.training && (
                    <div className="flex flex-wrap gap-2">
                      {persona.training.resume && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          <FileText className="h-3 w-3" /> Resume
                        </span>
                      )}
                      {persona.training.voice && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          <Mic className="h-3 w-3" /> Voice
                        </span>
                      )}
                      {persona.training.projects > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          <Link2 className="h-3 w-3" /> {persona.training.projects} Projects
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {persona.tags && persona.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {persona.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sample question hint */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/30 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="italic">Try: "{randomQ}"</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {isMock ? (
                    <Button disabled className="w-full h-11 opacity-60">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  ) : (
                    <Button asChild className="w-full h-11 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10 transition-shadow">
                      <a href={persona.conversation_link} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ask Them Anything
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* CTA at bottom */}
      <div className="text-center mt-16 mb-8 opacity-0 animate-fade-in">
        <p className="text-muted-foreground mb-4">Want people to discover you too?</p>
        <Button asChild size="lg" variant="outline" className="h-12 px-8">
          <Link to="/signup">Build Your Agent</Link>
        </Button>
      </div>
    </div>
  );
};

export default PublicPersonas;
