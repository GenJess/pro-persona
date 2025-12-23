import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Upload, Loader2, MessageCircle, Settings, Shield } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const conversationLink = profile?.elevenlabs_agent_link || persona?.conversation_link;
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-display mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and persona</p>
      </div>

      {/* Profile Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/10">
              <AvatarImage src={persona?.avatar_url ?? undefined} alt="Your avatar" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-muted-foreground">{user?.email}</p>
              {conversationLink && (
                <Button asChild className="mt-4">
                  <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with my Persona
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Your Persona
          </CardTitle>
          <CardDescription>
            {persona 
              ? "Manage your professional persona settings" 
              : "You haven't created a persona yet"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!persona ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Create your first persona to get started
              </p>
              <Button asChild>
                <Link to="/create-persona">Create Persona</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border border-border rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Professional Persona</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    persona.is_public 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {persona.is_public ? 'Public' : 'Private'}
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
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      visibility === 'private' 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50'
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
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      visibility === 'public' 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50'
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
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-border rounded-xl">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" disabled>Coming Soon</Button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-destructive/20 rounded-xl">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account</p>
            </div>
            <Button variant="destructive" disabled>Coming Soon</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
