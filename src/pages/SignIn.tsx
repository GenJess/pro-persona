import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, BotMessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/account');
    }
  }, [session, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error signing in',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Welcome back!' });
      navigate('/account');
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 overflow-hidden rounded-2xl border border-border/50 shadow-xl bg-card">
        {/* Left branding panel */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
          <div className="hero-orb-2 -bottom-20 -left-20 opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-8">
              <BotMessageSquare className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold font-display mb-4">Welcome back to ProPersona</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sign in to manage your professional AI persona, update your settings, and track conversations.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-10">
          <div className="space-y-2 mb-8">
            <h1 className="font-display text-2xl font-bold">Sign In</h1>
            <p className="text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" type="email" placeholder="Enter your email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-11 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" type="password" placeholder="Enter your password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 h-11 ${errors.password ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-11 font-semibold shadow-md shadow-primary/20">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center pt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
