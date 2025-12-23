import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle, AlertCircle, FileText, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';

const CreatePersona = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isPublic, setIsPublic] = useState('private');
  const [personaOutput, setPersonaOutput] = useState<{status: 'idle' | 'success' | 'error', message: string}>({status: 'idle', message: ''});
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
          toast({
            title: 'Document processed',
            description: 'Resume text extracted successfully.',
          });
        } else {
          toast({
            title: 'Processing failed',
            description: result.error || 'Could not extract text.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
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
      toast({ 
        title: 'Resume Required', 
        description: 'Please upload a resume or paste text.', 
        variant: 'destructive'
      });
      return;
    }
    
    if (!elevenLabsApiKey.trim()) {
      toast({ 
        title: 'API Key Required', 
        description: 'Please provide your ElevenLabs API key.', 
        variant: 'destructive'
      });
      return;
    }
    
    if (!user) {
      toast({ 
        title: 'Not Authenticated', 
        description: 'Please sign in to create a persona.', 
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    setPersonaOutput({ status: 'idle', message: '' });

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile?.first_name || !profile?.last_name) {
        throw new Error('Please ensure your profile has a first and last name.');
      }

      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: {
          resume_text: resumeText,
          first_name: profile.first_name,
          last_name: profile.last_name,
          elevenlabs_api_key: elevenLabsApiKey,
        },
      });

      if (agentError) throw agentError;

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

      // Update profile with agent info
      await supabase
        .from('profiles')
        .update({
          elevenlabs_agent_id: agentData.agent_id,
          elevenlabs_agent_link: conversationLink,
        })
        .eq('id', user.id);

      setPersonaOutput({ 
        status: 'success', 
        message: 'Persona created successfully! Redirecting...' 
      });
      toast({ title: 'Success!', description: 'Your persona is ready.' });
      setTimeout(() => navigate('/account'), 2000);

    } catch (error: any) {
      console.error("Error:", error);
      setPersonaOutput({ 
        status: 'error', 
        message: error.message 
      });
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
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

  return (
    <div className="flex justify-center items-start py-8 px-4">
      <Card className="w-full max-w-2xl border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-3xl">Create Your Persona</CardTitle>
          <CardDescription className="text-base">
            Upload your resume to generate an interactive AI persona
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
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
                  Processing document...
                </div>
              )}
              {fileName && !isProcessingFile && (
                <p className="text-sm text-muted-foreground">File: {fileName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-text">Resume Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume text here or upload a file..."
                className="min-h-[180px] resize-none"
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
                  placeholder="Your API Key" 
                  required 
                  value={elevenLabsApiKey} 
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key at{' '}
                <a href="https://elevenlabs.io/subscription" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  elevenlabs.io
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="grid grid-cols-2 gap-3">
                <Label 
                  htmlFor="create-private" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isPublic === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="private" id="create-private" />
                  <span className="font-medium">Private</span>
                </Label>
                <Label 
                  htmlFor="create-public" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isPublic === 'public' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="public" id="create-public" />
                  <span className="font-medium">Public</span>
                </Label>
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading || isProcessingFile} size="lg" className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Persona...
                </>
              ) : (
                'Create Persona'
              )}
            </Button>

            <div className={`w-full p-4 rounded-xl border-2 border-dashed min-h-[80px] flex items-center justify-center ${
              personaOutput.status === 'success' ? 'border-green-500/50 bg-green-500/5' :
              personaOutput.status === 'error' ? 'border-destructive/50 bg-destructive/5' :
              'border-border bg-muted/30'
            }`}>
              {personaOutput.status === 'idle' && (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="mx-auto h-6 w-6 mb-2" />
                  <p className="text-sm">Status will appear here</p>
                </div>
              )}
              {personaOutput.status === 'success' && (
                <div className="text-center text-green-600">
                  <CheckCircle className="mx-auto h-6 w-6 mb-2" />
                  <p className="font-medium">{personaOutput.message}</p>
                </div>
              )}
              {personaOutput.status === 'error' && (
                <div className="text-center text-destructive">
                  <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                  <p className="text-sm">{personaOutput.message}</p>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreatePersona;
