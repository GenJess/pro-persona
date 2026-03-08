import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Loader2, MessageSquare, Shield, Copy, Check, ExternalLink, Brain, FileText, Mic, Link2, ArrowRight, Lock, Pencil, Share2, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'Please make sure both passwords match.', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordDialogOpen(false);
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
  const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Your Account';

  const trainingItems = [
    { label: 'Resume', description: 'Professional background', done: hasAgent, icon: <FileText className="h-4 w-4" /> },
    { label: 'Voice Clone', description: '10s voice sample', done: false, icon: <Mic className="h-4 w-4" /> },
    { label: 'Projects', description: 'Links & portfolio', done: false, icon: <Link2 className="h-4 w-4" /> },
  ];

  const completedCount = trainingItems.filter(i => i.done).length;
  const completionPercent = Math.round((completedCount / trainingItems.length) * 100);
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 mb-8 opacity-0 animate-fade-in">
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
            <h1 className="text-2xl md:text-3xl font-bold font-display">{fullName}</h1>
            <p className="text-muted-foreground mt-1">Always available · Always informed · Always you</p>
            {conversationLink && (
              <div className="flex items-center gap-3 mt-5 flex-wrap justify-center sm:justify-start">
                <Button asChild className="h-11 shadow-md shadow-primary/20">
                  <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Talk to My Agent
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </a>
                </Button>
                <Button variant="outline" className="h-11" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Share Link'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Quick Stats */}
        <div className="p-5 rounded-xl border border-border/50 bg-card flex items-center gap-4 opacity-0 animate-fade-in stagger-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{completionPercent}%</p>
            <p className="text-xs text-muted-foreground">Agent Trained</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border/50 bg-card flex items-center gap-4 opacity-0 animate-fade-in stagger-2">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${persona?.is_public ? 'bg-success/10' : 'bg-muted'}`}>
            {persona?.is_public ? <Eye className="h-5 w-5 text-success" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{persona?.is_public ? 'Public' : 'Private'}</p>
            <p className="text-xs text-muted-foreground">Visibility</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border/50 bg-card flex items-center gap-4 opacity-0 animate-fade-in stagger-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${hasAgent ? 'bg-success/10' : 'bg-muted'}`}>
            <Brain className={`h-5 w-5 ${hasAgent ? 'text-success' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{hasAgent ? 'Live' : 'Setup'}</p>
            <p className="text-xs text-muted-foreground">Agent Status</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Agent Training Status */}
        {hasAgent && (
          <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-4">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                Training Status
              </CardTitle>
              <CardDescription className="mt-1">
                The more you add, the better your agent represents you.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{completedCount} of {trainingItems.length} completed</span>
                  <span className="font-medium text-primary">{completionPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {trainingItems.map((item) => (
                  <div 
                    key={item.label}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                      item.done 
                        ? 'border-success/30 bg-success/5' 
                        : 'border-border/50 bg-muted/20 hover:border-primary/20'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                      item.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.done ? <Check className="h-4 w-4" /> : item.icon}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {item.done ? 'Complete' : item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Settings */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-5">
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
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
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
          <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in stagger-6">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                Test Your Agent
              </CardTitle>
              <CardDescription className="mt-1">
                See how your agent represents you — try asking it questions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8">
              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                {[
                  "What are you working on?",
                  "Tell me about your background",
                  "Walk me through a project",
                  "What's your expertise?",
                ].map((q) => (
                  <div key={q} className="flex items-center gap-2.5 p-3.5 rounded-lg bg-muted/40 border border-border/30 text-sm text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="italic">"{q}"</span>
                  </div>
                ))}
              </div>
              <Button asChild className="h-11">
                <a href={conversationLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Talk to My Agent
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Card */}
        <Card className="border-border/50 shadow-sm opacity-0 animate-fade-in">
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
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter your new password below.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive">Passwords don't match</p>
                      )}
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={changingPassword || !newPassword || !confirmPassword}
                      className="w-full h-11"
                    >
                      {changingPassword ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border border-border/50 rounded-xl">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
