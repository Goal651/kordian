import { Github, Shield, Lock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Detect vulnerabilities, secrets, and misconfigurations",
  },
  {
    icon: Lock,
    title: "Read-Only Access",
    description: "We never modify your code or settings",
  },
  {
    icon: Zap,
    title: "On-Demand Analysis",
    description: "No data storage—scan when you need it",
  },
];

export default function Connect() {
  const navigate = useNavigate();

  const handleConnect = () => {
    // In a real app, this would redirect to GitHub OAuth
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="hero-glow fixed inset-0 pointer-events-none" />
      
      <div className="relative w-full max-w-lg">
        {/* Logo and heading */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 animate-glow">
            <Github className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <span className="gradient-text">GitGuard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Security & Productivity Dashboard
          </p>
        </div>

        {/* Main card */}
        <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
            Connect Your Organization
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Authorize GitGuard to analyze your GitHub organization's security posture
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 animate-slide-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Connect button */}
          <Button
            onClick={handleConnect}
            variant="glow"
            size="lg"
            className="w-full group"
          >
            <Github className="h-5 w-5" />
            Connect with GitHub
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By connecting, you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          Open source · Stateless · No data storage
        </p>
      </div>
    </div>
  );
}
