import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Users, ArrowRight, Sparkles, MessageSquare, Globe, Zap, Brain, Coffee, Search, Briefcase } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Prime Your Agent",
      description: "Upload your resume, paste your LinkedIn, add project links. Your agent learns everything about your professional self.",
      step: "01",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Clone Your Voice",
      description: "Record 10 seconds of your voice. Your agent doesn't just know your work — it sounds like you.",
      step: "02",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Go Live",
      description: "Share your agent publicly or keep it private. Anyone can have a real conversation with your professional twin.",
      step: "03",
    },
  ];

  const useCases = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "For Professionals",
      description: "Your agent works while you sleep. Answer questions, share your expertise, build your network — without lifting a finger.",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "For Recruiters & Teams",
      description: "Skip the screening call. Interview someone's agent first. Understand their actual expertise before you reach out.",
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "For the Curious",
      description: "Want to know what someone's building? Ask their agent. It's like a coffee chat — but async, instant, and always available.",
    },
  ];

  const stats = [
    { value: "AI", label: "Professional Agents", icon: <Brain className="h-5 w-5" /> },
    { value: "24/7", label: "Always Available", icon: <Zap className="h-5 w-5" /> },
    { value: "∞", label: "Conversations", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center pt-20 md:pt-32 pb-24 md:pb-36 overflow-hidden">
        <div className="hero-orb top-0 -right-48 opacity-60" />
        <div className="hero-orb-2 -top-20 -left-32 opacity-40" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-10 opacity-0 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI Agents as Your Professional Proxy
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.08] opacity-0 animate-slide-up stagger-1">
            Meet Professionals
            <br />
            <span className="gradient-text">Through Conversation.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in stagger-2">
            Not another portfolio. Not another resume. A real conversation with someone's 
            AI twin — trained on their work, projects, and voice. Ask anything. Get real answers.
          </p>
          
          <div className="mt-12 flex gap-4 justify-center flex-wrap opacity-0 animate-fade-in stagger-3">
            <Button size="lg" asChild className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link to="/signup">
                Build Your Agent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base font-semibold hover:bg-accent/50 transition-all">
              <Link to="/personas">Discover People</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Pitch — What Makes This Different */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-24 md:mb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-border/50 p-10 md:p-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-6 opacity-0 animate-fade-in">
              This isn't a voice clip library.
            </h2>
            <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed opacity-0 animate-fade-in stagger-1">
              <p>
                You prime your agent with your <strong className="text-foreground">actual resume, LinkedIn, and personality</strong>. 
                You clone your voice. You add links to your real projects and work.
              </p>
              <p>
                Now anyone can <strong className="text-foreground">ask you what you're working on</strong> and get 
                personal insights. They can <strong className="text-foreground">interview your agent</strong> and 
                get answers they'd probably get IRL.
              </p>
              <p>
                ProPersona takes the <strong className="text-foreground">burden of reading up on someone</strong> and 
                turns it into the <strong className="text-foreground">pleasure of catching up in conversation</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-24 md:mb-32">
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
            Build Your Agent in Minutes
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto opacity-0 animate-fade-in stagger-1">
            Three steps to create your professional AI twin.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative p-8 md:p-10 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 opacity-0 animate-slide-up stagger-${index + 2}`}
            >
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

      {/* Use Cases — Three-Column Value Prop */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-28 md:mb-36">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-5 opacity-0 animate-fade-in">
            Who Is This For?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto opacity-0 animate-fade-in stagger-1">
            Whether you're building your brand, hiring, or just curious — ProPersona changes how you connect with people.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {useCases.map((uc, index) => (
            <div 
              key={index} 
              className={`p-8 md:p-10 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 opacity-0 animate-slide-up stagger-${index + 2}`}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                {uc.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-3">{uc.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Questions — Show the Experience */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-28 md:mb-36">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-5 opacity-0 animate-fade-in">
            Imagine Asking Someone's Agent...
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 opacity-0 animate-fade-in stagger-2">
          {[
            "What are you working on right now?",
            "Tell me about your experience with machine learning.",
            "Walk me through your most impactful project.",
            "How did you get into this field?",
            "What's your approach to system design?",
            "What would you bring to our team?",
          ].map((q, i) => (
            <div key={i} className="flex items-center gap-3 p-5 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary shrink-0" />
              <span className="text-foreground font-medium">{q}</span>
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
              Ready to Let People Talk to You — Without You Being There?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Your agent is always available. Always informed. Always you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="h-12 px-10 text-base font-semibold shadow-lg shadow-primary/20">
                <Link to="/signup">
                  Create Your Agent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-10 text-base font-semibold">
                <Link to="/personas">
                  Explore Agents
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
