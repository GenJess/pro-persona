import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, FileText, Key, BotMessageSquare, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';
import { useAuth } from '@/contexts/AuthProvider';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState('public');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creationStep, setCreationStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate('/account');
  }, [session, navigate]);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s += 25;
    if (/[A-Z]/.test(password)) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    return s;
  })();

  const strengthLabel = passwordStrength <= 25 ? 'Weak' : passwordStrength <= 50 ? 'Fair' : passwordStrength <= 75 ? 'Good' : 'Strong';
  const strengthColor = passwordStrength <= 25 ? 'bg-destructive' : passwordStrength <= 50 ? 'bg-orange-400' : passwordStrength <= 75 ? 'bg-yellow-400' : 'bg-success';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setIsProcessingFile(true);
    try {
      const result = await processDocument(file);
      if (result.success) {
        setResumeText(result.text);
        toast({ title: 'Document processed', description: 'Resume text extracted successfully.' });
      } else {
        toast({ title: 'Processing failed', description: result.error || 'Could not extract text.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ email, password, firstName, lastName });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    if (!resumeText.trim()) {
      toast({ title: 'Resume Required', description: 'Please paste your resume or upload a document.', variant: 'destructive' });
      return;
    }
    if (!elevenLabsApiKey) {
      toast({ title: 'API Key Required', description: 'Please provide your ElevenLabs API key.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setCreationStep(1);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      setIsLoading(false); setCreationStep(0);
      toast({ title: 'Sign up failed', description: authError.message === 'User already registered' ? 'An account with this email already exists.' : authError.message, variant: 'destructive' });
      return;
    }
    
    const user = authData.user;
    if (!user) {
      setIsLoading(false); setCreationStep(0);
      toast({ title: 'Check your email', description: 'Please verify your email to complete registration.' });
      navigate('/');
      return;
    }

    setCreationStep(2);

    try {
      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: { resume_text: resumeText, first_name: firstName, last_name: lastName, elevenlabs_api_key: elevenLabsApiKey },
      });
      if (agentError) throw agentError;
      
      setCreationStep(3);

      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}&scale=100`;
      const conversationLink = `https://elevenlabs.io/app/talk-to?agent_id=${agentData.agent_id}`;

      await supabase.from('profiles').update({ elevenlabs_agent_id: agentData.agent_id, elevenlabs_agent_link: conversationLink }).eq('id', user.id);

      const { error: insertError } = await supabase.from('personas').insert({
        user_id: user.id, is_public: isPublic === 'public', elevenlabs_api_key: elevenLabsApiKey,
        agent_id: agentData.agent_id, conversation_link: conversationLink, avatar_url: avatarUrl,
      });
      if (insertError) throw insertError;

      setCreationStep(4);
    } catch (error: any) {
      setIsLoading(false); setCreationStep(0);
      toast({ title: 'Error Creating Persona', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      return;
    }

    setIsLoading(false);
    toast({ title: 'Account created!', description: 'Your persona has been set up successfully.' });
    navigate('/account');
  };

  const steps = ['Creating account...', 'Building AI agent...', 'Setting up persona...', 'Done!'];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-5 gap-0 overflow-hidden rounded-2xl border border-border/50 shadow-xl bg-card">
        {/* Left branding panel */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-center p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
          <div className="hero-orb-2 -bottom-20 -left-20 opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-8">
              <BotMessageSquare className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-4">Create your AI persona</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Upload your resume and let AI create a voice-interactive professional persona for you.
            </p>
            <div className="space-y-4">
              {['AI voice agent', 'Share publicly or privately', 'Always available 24/7'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="md:col-span-3 p-8 md:p-12 overflow-y-auto max-h-[85vh]">
          <div className="space-y-1.5 mb-8">
            <h1 className="font-display text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground">Set up your professional AI persona</p>
          </div>

          {/* Progress indicator during creation */}
          {isLoading && creationStep > 0 && (
            <div className="mb-8 p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">{steps[creationStep - 1]}</span>
                <span className="text-muted-foreground">{creationStep}/4</span>
              </div>
              <Progress value={creationStep * 25} className="h-2" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-sm font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="first-name" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className={`pl-10 h-11 ${errors.firstName ? 'border-destructive' : ''}`} />
                </div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-sm font-medium">Last Name</Label>
                <Input id="last-name" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className={`h-11 ${errors.lastName ? 'border-destructive' : ''}`} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-11 ${errors.email ? 'border-destructive' : ''}`} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Minimum 8 characters" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 h-11 ${errors.password ? 'border-destructive' : ''}`} />
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${passwordStrength}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm font-medium">Upload Resume (PDF, DOCX, TXT)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="resume" type="file" onChange={handleFileChange} className="pl-10 h-11 file:text-primary file:font-medium cursor-pointer" accept=".pdf,.docx,.txt,.doc" disabled={isProcessingFile} />
              </div>
              {isProcessingFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing document...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-text" className="text-sm font-medium">Resume Text</Label>
              <Textarea id="resume-text" placeholder="Paste your resume text here or upload a file above..." className="min-h-[120px] resize-none" value={resumeText} onChange={(e) => setResumeText(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevenlabs-api-key" className="text-sm font-medium">ElevenLabs API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="elevenlabs-api-key" type="password" placeholder="Your ElevenLabs API Key" required value={elevenLabsApiKey} onChange={(e) => setElevenLabsApiKey(e.target.value)} className="pl-10 h-11" />
              </div>
              <p className="text-xs text-muted-foreground">
                Get yours at{' '}
                <a href="https://elevenlabs.io/subscription" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">elevenlabs.io</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Persona Visibility</Label>
              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="grid grid-cols-2 gap-4">
                <Label htmlFor="signup-private" className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isPublic === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}>
                  <RadioGroupItem value="private" id="signup-private" />
                  <div><span className="font-medium">Private</span><p className="text-xs text-muted-foreground mt-0.5">Only you</p></div>
                </Label>
                <Label htmlFor="signup-public" className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isPublic === 'public' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}>
                  <RadioGroupItem value="public" id="signup-public" />
                  <div><span className="font-medium">Public</span><p className="text-xs text-muted-foreground mt-0.5">Discoverable</p></div>
                </Label>
              </RadioGroup>
            </div>

            <Button type="submit" disabled={isLoading || isProcessingFile} className="w-full h-12 text-base font-semibold shadow-md shadow-primary/20 mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Persona
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center pt-1">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
