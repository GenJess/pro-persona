import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Users, Shield, ArrowRight, Sparkles, Mic, Globe, Zap } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Once",
      description: "Upload your resume and create a professional AI persona in minutes.",
      step: "01",
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice-Powered",
      description: "Your persona speaks with AI voice, sharing your experience naturally.",
      step: "02",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Share & Discover",
      description: "Make your persona public or keep it private — full control is yours.",
      step: "03",
    },
  ];

  const stats = [
    { value: "AI", label: "Voice Agents", icon: <Zap className="h-5 w-5" /> },
    { value: "24/7", label: "Always Available", icon: <Shield className="h-5 w-5" /> },
    { value: "∞", label: "Conversations", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center pt-20 md:pt-32 pb-24 md:pb-36 overflow-hidden">
        {/* Background orbs */}
        <div className="hero-orb top-0 -right-48 opacity-60" />
        <div className="hero-orb-2 -top-20 -left-32 opacity-40" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-10 opacity-0 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI-Powered Professional Personas
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.08] opacity-0 animate-slide-up stagger-1">
            Your Resume,
            <br />
            <span className="gradient-text">Now It Speaks.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in stagger-2">
            Transform your static resume into a dynamic, voice-interactive AI persona. 
            Upload once, share everywhere, let AI represent you 24/7.
          </p>
          
          <div className="mt-12 flex gap-4 justify-center flex-wrap opacity-0 animate-fade-in stagger-3">
            <Button size="lg" asChild className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base font-semibold hover:bg-accent/50 transition-all">
              <Link to="/personas">Explore Personas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-4xl mx-auto px-4 -mt-8 mb-24 md:mb-32">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className={`text-center p-6 md:p-8 rounded-2xl bg-card border border-border/50 shadow-sm opacity-0 animate-fade-in stagger-${i + 2}`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold font-display text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-28 md:mb-36">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-5 opacity-0 animate-fade-in">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto opacity-0 animate-fade-in stagger-1">
            Three simple steps to create your professional AI persona.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative p-8 md:p-10 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 opacity-0 animate-slide-up stagger-${index + 2}`}
            >
              {/* Step number */}
              <span className="absolute top-6 right-6 text-6xl font-display font-extrabold text-muted/60 select-none">
                {feature.step}
              </span>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-24 md:mb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-12 md:p-20 text-center">
          <div className="hero-orb-2 -bottom-32 -right-32 opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-5">
              Ready to Let Your Resume Speak?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Join professionals who are using AI to showcase their experience in a whole new way.
            </p>
            <Button size="lg" asChild className="h-12 px-10 text-base font-semibold shadow-lg shadow-primary/20">
              <Link to="/signup">
                Create Your Persona
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
