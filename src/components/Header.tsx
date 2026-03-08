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
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <BotMessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold font-display">
            ProPersona
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                location.pathname === link.href 
                  ? 'text-primary bg-primary/5 font-semibold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
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

      {/* Mobile Menu with animation */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 ease-out",
        mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="border-t border-border bg-background p-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
                  location.pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-2 pt-3 border-t border-border">
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
      </div>
    </header>
  );
};

export default Header;
