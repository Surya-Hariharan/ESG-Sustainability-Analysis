import { 
  Building2, 
  BarChart3, 
  AlertTriangle, 
  Brain, 
  FileText, 
  Search,
  TrendingUp,
  Shield,
  Users,
  Zap,
  Globe,
  Target
} from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Building2,
      title: "Company Explorer",
      description: "Deep dive into individual S&P 500 companies with comprehensive ESG profiles, scores, and trend analysis.",
      gradient: "bg-gradient-primary",
      delay: "0s"
    },
    {
      icon: BarChart3,
      title: "Sector Insights",
      description: "Interactive visualizations comparing ESG performance across sectors with drill-down capabilities.",
      gradient: "bg-gradient-secondary",
      delay: "0.1s"
    },
    {
      icon: AlertTriangle,
      title: "Controversy Watch",
      description: "Real-time monitoring of ESG controversies with risk-level indicators and impact assessments.",
      gradient: "bg-gradient-accent",
      delay: "0.2s"
    },
    {
      icon: Brain,
      title: "AI Risk Predictor",
      description: "Machine learning models for predicting ESG risk levels based on multiple data points and trends.",
      gradient: "bg-gradient-primary",
      delay: "0.3s"
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Powerful filtering and search capabilities across all ESG metrics, sectors, and risk categories.",
      gradient: "bg-gradient-secondary",
      delay: "0.4s"
    },
    {
      icon: FileText,
      title: "Custom Reports",
      description: "Generate downloadable reports with customizable charts, tables, and ESG analytics.",
      gradient: "bg-gradient-accent",
      delay: "0.5s"
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Historical ESG performance tracking with predictive trend modeling and forecasting.",
      gradient: "bg-gradient-primary",
      delay: "0.6s"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk scoring methodology with real-time updates and benchmarking.",
      gradient: "bg-gradient-secondary",
      delay: "0.7s"
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Aligned with international ESG frameworks including SASB, GRI, and TCFD standards.",
      gradient: "bg-gradient-accent",
      delay: "0.8s"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 glass-card px-6 py-3 mb-8">
            <Zap className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-foreground-secondary">
              Powerful Features
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            <span className="text-gradient-primary">Advanced ESG</span>
            <br />
            <span className="text-foreground">Intelligence Tools</span>
          </h2>
          
          <p className="text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
            Comprehensive suite of tools designed to provide deep insights into 
            ESG performance, risk assessment, and sustainability trends across 
            the S&P 500 ecosystem.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-auto-fit gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-8 hover-lift group relative overflow-hidden animate-slide-up"
                style={{ animationDelay: feature.delay }}
              >
                {/* Gradient Background */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-foreground-secondary leading-relaxed group-hover:text-foreground transition-colors">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-xl transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <Target className="w-6 h-6 text-accent" />
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-gradient-primary">
              Ready to Transform Your ESG Analysis?
            </h3>
            
            <p className="text-foreground-secondary mb-6">
              Join leading investors and analysts using our platform for data-driven ESG decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-primary hover:shadow-glow px-8 py-3 rounded-lg font-semibold text-primary-foreground hover-lift transition-all">
                Start Free Trial
              </button>
              <button className="border border-primary/30 hover:bg-primary/10 px-8 py-3 rounded-lg font-semibold text-primary hover-lift transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;