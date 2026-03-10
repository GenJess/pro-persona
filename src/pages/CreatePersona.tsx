import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle, AlertCircle, FileText, Key, Brain, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';
import { Progress } from '@/components/ui/progress';

const CreatePersona = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isPublic, setIsPublic] = useState('public');
  const [personaOutput, setPersonaOutput] = useState<{status: 'idle' | 'creating' | 'success' | 'error', message: string, step: number}>({status: 'idle', message: '', step: 0});
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
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
    } else {
      setResumeFile(null);
      setFileName('');
      setResumeText('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!resumeText.trim()) {
      toast({ title: 'Resume Required', description: 'Please upload a resume or paste your experience.', variant: 'destructive' });
      return;
    }
    
    if (!user) {
      toast({ title: 'Not Authenticated', description: 'Please sign in to create an agent.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setPersonaOutput({ status: 'creating', message: 'Training your agent...', step: 1 });

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile?.first_name || !profile?.last_name) {
        throw new Error('Please ensure your profile has a first and last name.');
      }

      setPersonaOutput({ status: 'creating', message: 'Creating AI agent...', step: 2 });

      let agentId = null;
      
      if (elevenLabsApiKey.trim()) {
        const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
          body: {
            resume_text: resumeText,
            first_name: profile.first_name,
            last_name: profile.last_name,
            elevenlabs_api_key: elevenLabsApiKey,
          },
        });

        if (agentError) throw agentError;
        agentId = agentData.agent_id;
      }

      if (agentError) throw agentError;

      setPersonaOutput({ status: 'creating', message: 'Setting up profile...', step: 3 });

      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}&scale=100`;
      const conversationLink = `https://elevenlabs.io/app/talk-to?agent_id=${agentData.agent_id}`;
      
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

      await supabase
        .from('profiles')
        .update({
          elevenlabs_agent_id: agentData.agent_id,
          elevenlabs_agent_link: conversationLink,
        })
        .eq('id', user.id);

      setPersonaOutput({ status: 'success', message: 'Your agent is live! Redirecting...', step: 4 });
      toast({ title: 'Agent created!', description: 'Your professional agent is ready.' });
      setTimeout(() => navigate('/account'), 2000);

    } catch (error: any) {
      console.error("Error:", error);
      setPersonaOutput({ status: 'error', message: error.message, step: 0 });
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps = ['Analyzing resume', 'Creating AI agent', 'Setting up profile', 'Agent is live!'];

  return (
    <div className="flex justify-center items-start py-4 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
            <Brain className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Build Your Agent</h1>
          <p className="text-muted-foreground text-lg">
            Prime your AI twin with your professional self
          </p>
        </div>

        {/* Creation progress */}
        {personaOutput.status === 'creating' && (
          <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">{personaOutput.message}</span>
              <span className="text-muted-foreground">{personaOutput.step}/4</span>
            </div>
            <Progress value={personaOutput.step * 25} className="h-2" />
            <div className="grid grid-cols-4 gap-1">
              {steps.map((step, i) => (
                <div key={step} className={`text-xs text-center ${i < personaOutput.step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        <Card className="border-border/50 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Professional Context</Label>
                <p className="text-sm text-muted-foreground">Upload a resume <span className="font-medium text-foreground">or</span> paste your experience below — whichever is easier.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume" className="text-sm font-medium">Option 1: Upload a File</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="resume" 
                    type="file" 
                    onChange={handleFileChange} 
                    className="pl-10 h-11 file:text-primary file:font-medium cursor-pointer" 
                    accept=".pdf,.docx,.txt,.doc" 
                    disabled={isProcessingFile}
                  />
                </div>
                {isProcessingFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing document...
                  </div>
                )}
                {fileName && !isProcessingFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    {fileName}
                  </p>
                )}
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs font-medium text-muted-foreground uppercase">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-text" className="text-sm font-medium">Option 2: Paste Your Experience</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your resume, LinkedIn summary, bio, or anything about your professional background..."
                  className="min-h-[160px] resize-none"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="elevenlabs-api-key" className="text-sm font-medium">ElevenLabs API Key</Label>
                  <span className="text-xs text-muted-foreground">(optional — add later for voice cloning)</span>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="elevenlabs-api-key" 
                    type="password" 
                    placeholder="sk-..." 
                    value={elevenLabsApiKey} 
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Needed for voice cloning. You can always add this later.{' '}
                  <a href="https://elevenlabs.io/subscription" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Get a key →
                  </a>
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Agent Visibility</Label>
                <RadioGroup value={isPublic} onValueChange={setIsPublic} className="grid grid-cols-2 gap-3">
                  <Label 
                    htmlFor="create-private" 
                    className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isPublic === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <RadioGroupItem value="private" id="create-private" />
                    <div>
                      <span className="font-medium">Private</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Link only</p>
                    </div>
                  </Label>
                  <Label 
                    htmlFor="create-public" 
                    className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isPublic === 'public' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <RadioGroupItem value="public" id="create-public" />
                    <div>
                      <span className="font-medium">Public</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Discoverable</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-6 md:px-8 pb-8">
              <Button type="submit" disabled={isLoading || isProcessingFile} size="lg" className="w-full h-12 text-base font-semibold shadow-md shadow-primary/20">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building Agent...
                  </>
                ) : (
                  <>
                    Build My Agent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {personaOutput.status === 'success' && (
                <div className="w-full p-4 rounded-xl border border-success/30 bg-success/5 text-center">
                  <CheckCircle className="mx-auto h-6 w-6 text-success mb-2" />
                  <p className="font-medium text-success">{personaOutput.message}</p>
                </div>
              )}
              {personaOutput.status === 'error' && (
                <div className="w-full p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-destructive mb-2" />
                  <p className="text-sm text-destructive">{personaOutput.message}</p>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePersona;
