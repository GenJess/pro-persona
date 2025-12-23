import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PublicPersona {
  id: string;
  avatar_url: string | null;
  agent_id: string | null;
  conversation_link: string;
}

const PublicPersonas = () => {
  const [personas, setPersonas] = useState<PublicPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicPersonas = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('personas')
        .select('id, avatar_url, agent_id')
        .eq('is_public', true);
      
      if (error) {
        console.error("Error fetching public personas:", error);
        toast({ 
          title: "Error", 
          description: "Could not fetch public personas.", 
          variant: "destructive"
        });
        setPersonas([]);
      } else {
        const formattedPersonas = (data || [])
          .filter(p => p.agent_id)
          .map((p) => ({
            id: p.id,
            avatar_url: p.avatar_url,
            agent_id: p.agent_id,
            conversation_link: `https://elevenlabs.io/app/talk-to?agent_id=${p.agent_id}`
          }));

        setPersonas(formattedPersonas);
      }
      setLoading(false);
    };
    
    fetchPublicPersonas();
  }, [toast]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
          Discover <span className="text-primary">Personas</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore public professional personas from our community. Connect with AI-powered professionals and discover new opportunities.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading personas...</p>
          </div>
        </div>
      ) : personas.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No public personas yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to create a public persona and showcase your professional voice to the world.
          </p>
          <Button asChild size="lg">
            <Link to="/signup">Create Your Persona</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <Card 
              key={persona.id} 
              className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={persona.avatar_url ?? undefined} alt="Persona avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">AI Persona</CardTitle>
                    <p className="text-sm text-muted-foreground">Voice Agent</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground">
                  An AI-powered professional persona ready to chat about their experience and expertise.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <a href={persona.conversation_link} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Conversation
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicPersonas;
