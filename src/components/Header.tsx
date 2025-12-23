import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BotMessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/personas', label: 'Personas' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: "Error signing out", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BotMessageSquare className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-display bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ProPersona
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'transition-colors hover:text-primary relative py-2',
                location.pathname === link.href 
                  ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' 
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {session ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors',
                  location.pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-2 pt-4 border-t border-border">
            {session ? (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
