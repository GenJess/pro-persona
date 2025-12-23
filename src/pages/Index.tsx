import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Users, Shield, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Once",
      description: "Upload your resume and create a professional AI persona instantly.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Share & Discover",
      description: "Make your persona public or keep it private for personal use.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Your Control",
      description: "Full control over visibility and how your information is shared.",
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-12 md:pt-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          AI-Powered Professional Personas
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Your Voice, Your Resume,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Professional Persona.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
          Transform your static resume into a dynamic, voice-interactive AI persona. Upload once, use everywhere.
        </p>
        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild className="h-12 px-8 font-semibold">
            <Link to="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-8 font-semibold">
            <Link to="/personas">Explore Personas</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">How It Works</h2>
        <p className="text-muted-foreground text-lg mb-12">Create your professional persona in minutes.</p>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
