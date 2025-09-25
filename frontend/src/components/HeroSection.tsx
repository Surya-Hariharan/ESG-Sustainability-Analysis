import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, BarChart3, Zap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const stats = [
    { label: 'S&P 500 Companies', value: '500+', icon: Building2 },
    { label: 'ESG Data Points', value: '10M+', icon: BarChart3 },
    { label: 'Risk Models', value: '25+', icon: Shield },
    { label: 'Real-time Updates', value: '24/7', icon: Zap },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 glass-card px-6 py-3 mb-8 animate-fade-in">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground-secondary">
              Advanced ESG Risk Intelligence Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-slide-up">
            <span className="text-gradient-primary">ESG Risk</span>
            <br />
            <span className="text-foreground">Analytics</span>
            <br />
            <span className="text-gradient-accent">Dashboard</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-foreground-secondary max-w-3xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Unlock comprehensive ESG insights for S&P 500 companies with 
            <span className="text-primary font-semibold"> AI-powered analytics</span>, 
            interactive visualizations, and 
            <span className="text-accent font-semibold"> predictive risk modeling</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-4 hover-lift group"
            >
              <Link to="/companies">
                Explore Companies
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-4 hover-lift"
            >
              <Link to="/predictor">
                Try ESG Predictor
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card p-6 text-center hover-lift group"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground-secondary font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;