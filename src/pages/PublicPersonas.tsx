import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2, MessageSquare, Sparkles, Search, Brain } from "lucide-react";
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
}

const sampleQuestions = [
  "What are you working on?",
  "Tell me about your background",
  "Walk me through a project",
  "How did you get into this?",
  "What's your expertise?",
  "What would you bring to a team?",
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

      const formattedPersonas = personasWithAgent.map((p) => {
        const profile = profileMap.get(p.user_id);
        return {
          id: p.id,
          avatar_url: p.avatar_url,
          agent_id: p.agent_id,
          conversation_link: `https://elevenlabs.io/app/talk-to?agent_id=${p.agent_id}`,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
        };
      });

      setPersonas(formattedPersonas);
      setLoading(false);
    };
    
    fetchPublicPersonas();
  }, [toast]);

  const filteredPersonas = personas.filter(p => {
    if (!searchQuery) return true;
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 opacity-0 animate-fade-in">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 opacity-0 animate-slide-up stagger-1">
          Discover <span className="gradient-text">Professionals</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in stagger-2">
          Have real conversations with AI agents trained on real people's work, projects, and expertise. Ask them anything.
        </p>
      </div>

      {/* Search */}
      {personas.length > 0 && (
        <div className="max-w-md mx-auto mb-10 opacity-0 animate-fade-in stagger-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find people working on..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border/50"
            />
          </div>
        </div>
      )}

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
            return (
              <Card 
                key={persona.id} 
                className={`group border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 opacity-0 animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/30 transition-all shadow-md">
                      <AvatarImage src={persona.avatar_url ?? undefined} alt="Agent avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-lg font-semibold">
                        {persona.first_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {persona.first_name && persona.last_name 
                          ? `${persona.first_name} ${persona.last_name}` 
                          : "Professional Agent"
                        }
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Professional Agent</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    An AI agent trained on their real resume, projects, and expertise. Ask them anything about their work.
                  </p>
                  {/* Sample question hint */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/30 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="italic">Try: "{randomQ}"</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full h-11 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10 transition-shadow">
                    <a href={persona.conversation_link} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Them Anything
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicPersonas;
