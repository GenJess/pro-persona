import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Upload, Loader2, MessageSquare, Shield, Copy, Check, ExternalLink, Brain, FileText, Mic, Link2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  elevenlabs_agent_id: string | null;
  elevenlabs_agent_link: string | null;
}

interface Persona {
  id: string;
  is_public: boolean;
  updated_at: string;
  avatar_url: string | null;
  conversation_link: string | null;
}

const Account = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState('private');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, elevenlabs_agent_id, elevenlabs_agent_link')
        .eq('id', user!.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      const { data: personaData, error: personaError } = await supabase
        .from('personas')
        .select('id, is_public, updated_at, avatar_url, conversation_link')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (personaError) {
        console.error('Error fetching persona:', personaError);
      } else if (personaData) {
        setPersona(personaData);
        setVisibility(personaData.is_public ? 'public' : 'private');
      }

      setLoading(false);
    };

    fetchData();
  }, [session, user, navigate]);

  const handleVisibilitySave = async () => {
    if (!persona) return;
    setSaving(true);

    const { error } = await supabase
      .from('personas')
      .update({ is_public: visibility === 'public' })
      .eq('id', persona.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'Could not update visibility.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Visibility settings updated.' });
      setPersona({ ...persona, is_public: visibility === 'public' });
    }
  };

  const copyLink = () => {
    const link = profile?.elevenlabs_agent_link || persona?.conversation_link;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Agent link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const conversationLink = profile?.elevenlabs_agent_link || persona?.conversation_link;
  const hasAgent = !!persona?.conversation_link || !!profile?.elevenlabs_agent_id;

  // Training status items
  const trainingItems = [
    { label: 'Resume', done: hasAgent, icon: <FileText className="h-4 w-4" /> },
    { label: 'Voice Clone', done: false, icon: <Mic className="h-4 w-4" /> },
    { label: 'Projects', done: false, icon: <Link2 className="h-4 w-4" /> },
  ];
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 mb-10 opacity-0 animate-fade-in">
        <div className="hero-orb-2 -top-20 -right-20 opacity-20" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
            <AvatarImage src={persona?.avatar_url ?? undefined} alt="Your avatar" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
              {profile?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-primary font-medium mb-1">Your Professional Agent</p>
            <h1 className="text-2xl md:text-3xl font-bold font-display">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Your Account'}
            </h1>
            <p className="text-muted-foreground mt-1">Always available. Always informed. Always you.</p>
            {conversationLink && (
              <div className="flex items-center gap-3 mt-5 flex-wrap justify-center sm:justify-start">
                <Button asChild className="h-11 shadow-md shadow-primary/20">
                  <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with My Agent
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </a>
                </Button>
                <Button variant="outline" className="h-11" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Agent Training Status */}
        {hasAgent && (
          <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-1">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                Agent Training
              </CardTitle>
              <CardDescription className="mt-1">
                What your agent has been trained on. Add more to make it smarter.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {trainingItems.map((item) => (
                  <div 
                    key={item.label}
                    className={`flex items-center gap-3 p-4 rounded-xl border ${
                      item.done 
                        ? 'border-success/30 bg-success/5' 
                        : 'border-border/50 bg-muted/20'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      item.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.done ? <Check className="h-4 w-4" /> : item.icon}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {item.done ? 'Added' : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Settings */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-2">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              Agent Settings
            </CardTitle>
            <CardDescription className="mt-1">
              {persona ? "Control who can discover and talk to your agent" : "You haven't built an agent yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8 space-y-6">
            {!persona ? (
              <div className="text-center py-14 border-2 border-dashed border-border rounded-xl bg-muted/20">
                <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Build Your Professional Agent</h3>
                <p className="text-muted-foreground mb-5 max-w-sm mx-auto">
                  Upload your resume, prime your agent with your work, and let people learn from you 24/7.
                </p>
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/create-persona">
                    Build Your Agent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Professional Agent</h3>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      persona.is_public 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {persona.is_public ? '● Public' : '○ Private'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(persona.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-5">
                  <Label className="text-base font-semibold">Discoverability</Label>
                  <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
                    <Label 
                      htmlFor="private" 
                      className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                        visibility === 'private' 
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <RadioGroupItem value="private" id="private" />
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium">Private</span>
                        <p className="text-sm text-muted-foreground mt-0.5">Only people with your link can talk to your agent</p>
                      </div>
                    </Label>
                    <Label 
                      htmlFor="public" 
                      className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                        visibility === 'public' 
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <RadioGroupItem value="public" id="public" />
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium">Public</span>
                        <p className="text-sm text-muted-foreground mt-0.5">Anyone can discover your agent on the Explore page</p>
                      </div>
                    </Label>
                  </RadioGroup>
                  <Button onClick={handleVisibilitySave} disabled={saving} className="w-full sm:w-auto h-11">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Test Your Agent */}
        {conversationLink && (
          <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-3">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                Test Your Agent
              </CardTitle>
              <CardDescription className="mt-1">
                Talk to your own agent to see how it performs and what it knows
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Try asking your agent questions like "What are you working on?" or "Tell me about your experience" to test how well it represents you.
                </p>
                <Button asChild className="h-11">
                  <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Talk to My Agent
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Card */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-4">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              Security
            </CardTitle>
            <CardDescription className="mt-1">Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border border-border/50 rounded-xl">
              <div>
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update your account password</p>
              </div>
              <Button variant="outline" disabled>Coming Soon</Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border border-destructive/20 rounded-xl">
              <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Permanently delete your account and agent</p>
              </div>
              <Button variant="destructive" disabled>Coming Soon</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
