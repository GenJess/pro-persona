import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, FileText, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';
import { useAuth } from '@/contexts/AuthProvider';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/account');
    }
  }, [session, navigate]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsProcessingFile(true);

    try {
      const result = await processDocument(file);
      if (result.success) {
        setResumeText(result.text);
        toast({
          title: 'Document processed',
          description: 'Your resume text has been extracted successfully.',
        });
      } else {
        toast({
          title: 'Processing failed',
          description: result.error || 'Could not extract text from the document.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while processing your document.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    // Validate basic fields
    const result = signUpSchema.safeParse({ email, password, firstName, lastName });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!resumeText.trim()) {
      toast({
        title: 'Resume Required',
        description: 'Please paste your resume or upload a document.',
        variant: 'destructive',
      });
      return;
    }

    if (!elevenLabsApiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please provide your ElevenLabs API key.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      setIsLoading(false);
      toast({
        title: 'Sign up failed',
        description: authError.message === 'User already registered'
          ? 'An account with this email already exists. Please sign in.'
          : authError.message,
        variant: 'destructive',
      });
      return;
    }
    
    const user = authData.user;
    if (!user) {
      setIsLoading(false);
      toast({
        title: 'Check your email',
        description: 'Please verify your email to complete registration.',
      });
      navigate('/');
      return;
    }
    
    // 2. Create ElevenLabs agent via Edge Function
    try {
      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: {
          resume_text: resumeText,
          first_name: firstName,
          last_name: lastName,
          elevenlabs_api_key: elevenLabsApiKey,
        },
      });

      if (agentError) throw agentError;
      
      // Generate avatar URL
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}&scale=100`;
      const conversationLink = `https://elevenlabs.io/app/talk-to?agent_id=${agentData.agent_id}`;

      // 3. Update profile with agent info
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          elevenlabs_agent_id: agentData.agent_id,
          elevenlabs_agent_link: conversationLink
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
      }

      // 4. Store persona in database
      const { error: insertError } = await supabase
        .from('personas')
        .insert({
          user_id: user.id,
          is_public: isPublic === 'public',
          elevenlabs_api_key: elevenLabsApiKey,
          agent_id: agentData.agent_id,
          conversation_link: conversationLink,
          avatar_url: avatarUrl,
        });

      if (insertError) throw insertError;

    } catch (error: any) {
      setIsLoading(false);
      toast({ 
        title: 'Error Creating Persona', 
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(false);
    toast({
      title: 'Account created!',
      description: 'Your persona has been set up successfully.',
    });
    navigate('/account');
  };

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <Card className="w-full max-w-lg border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-display text-3xl">Create Your Account</CardTitle>
          <CardDescription className="text-base">
            Set up your professional AI persona
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="first-name" 
                    type="text" 
                    placeholder="John" 
                    required 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name" 
                  type="text" 
                  placeholder="Doe" 
                  required 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Minimum 8 characters" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resume">Upload Resume (PDF, DOCX, TXT)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="resume" 
                  type="file" 
                  onChange={handleFileChange} 
                  className="pl-10 file:text-primary file:font-medium cursor-pointer" 
                  accept=".pdf,.docx,.txt,.doc"
                  disabled={isProcessingFile}
                />
              </div>
              {isProcessingFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing document...</span>
                </div>
              )}
              {resumeFile && !isProcessingFile && (
                <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-text">Resume Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume text here or upload a file above..."
                className="min-h-[120px] resize-none"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="elevenlabs-api-key" 
                  type="password" 
                  placeholder="Your ElevenLabs API Key" 
                  required 
                  value={elevenLabsApiKey} 
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Required for AI voice. Get yours at{' '}
                <a 
                  href="https://elevenlabs.io/subscription" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  elevenlabs.io
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <Label>Persona Visibility</Label>
              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="grid grid-cols-2 gap-3">
                <Label 
                  htmlFor="private" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isPublic === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="private" id="private" />
                  <div>
                    <span className="font-medium">Private</span>
                    <p className="text-xs text-muted-foreground">Only you</p>
                  </div>
                </Label>
                <Label 
                  htmlFor="public" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isPublic === 'public' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="public" id="public" />
                  <div>
                    <span className="font-medium">Public</span>
                    <p className="text-xs text-muted-foreground">Discoverable</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading || isProcessingFile} className="w-full h-11 font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Persona'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
