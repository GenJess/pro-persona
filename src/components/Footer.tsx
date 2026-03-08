import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold font-display">ProPersona</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Meet professionals through conversation, not resumes. AI agents trained on real people's work, projects, and expertise.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Platform</h4>
            <nav className="flex flex-col space-y-2.5">
              <Link to="/personas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Explore Agents
              </Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Build Your Agent
              </Link>
              <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
            </nav>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ProPersona turns the burden of reading up on someone into the pleasure of catching up in conversation. Powered by ElevenLabs AI.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ProPersona. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Your professional proxy, always on ✨
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
