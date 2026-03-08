import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Upload, Loader2, MessageCircle, Settings, Shield, Copy, Check, ExternalLink } from 'lucide-react';
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
      toast({ title: 'Copied!', description: 'Conversation link copied to clipboard.' });
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
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-10 mb-8 opacity-0 animate-fade-in">
        <div className="hero-orb-2 -top-20 -right-20 opacity-20" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
            <AvatarImage src={persona?.avatar_url ?? undefined} alt="Your avatar" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
              {profile?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold font-display">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Your Account'}
            </h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
            {conversationLink && (
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center sm:justify-start">
                <Button asChild size="sm" className="shadow-md shadow-primary/20">
                  <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Persona
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Persona Card */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              Your Persona
            </CardTitle>
            <CardDescription>
              {persona ? "Manage your professional persona settings" : "You haven't created a persona yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!persona ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Create your first persona to get started
                </p>
                <Button asChild>
                  <Link to="/create-persona">Create Persona</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Professional Persona</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
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

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Persona Visibility</Label>
                  <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
                    <Label 
                      htmlFor="private" 
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        visibility === 'private' 
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <RadioGroupItem value="private" id="private" />
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium">Private</span>
                        <p className="text-sm text-muted-foreground">Only you can see and share your persona</p>
                      </div>
                    </Label>
                    <Label 
                      htmlFor="public" 
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        visibility === 'public' 
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <RadioGroupItem value="public" id="public" />
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium">Public</span>
                        <p className="text-sm text-muted-foreground">Anyone can discover your persona</p>
                      </div>
                    </Label>
                  </RadioGroup>
                  <Button onClick={handleVisibilitySave} disabled={saving} className="w-full sm:w-auto">
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

        {/* Security Card */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-border/50 rounded-xl">
              <div>
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" disabled>Coming Soon</Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-destructive/20 rounded-xl">
              <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
              <Button variant="destructive" size="sm" disabled>Coming Soon</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
