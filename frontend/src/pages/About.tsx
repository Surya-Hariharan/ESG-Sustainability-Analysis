import Sidebar from '@/components/Sidebar';
import { useModelInfo } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  Database, 
  Shield, 
  TrendingUp, 
  Users, 
  Code, 
  ExternalLink,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const About = () => {
  const { data: modelInfo, isLoading: modelLoading } = useModelInfo();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning models analyze ESG risk factors with high precision and reliability."
    },
    {
      icon: Database,
      title: "Comprehensive Data",
      description: "Real-time ESG data covering environmental impact, social responsibility, and governance metrics."
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Sophisticated risk scoring methodology to identify potential ESG-related business risks."
    },
    {
      icon: TrendingUp,
      title: "Predictive Insights",
      description: "Forward-looking analytics to anticipate ESG performance trends and potential issues."
    },
    {
      icon: Users,
      title: "Stakeholder Focus",
      description: "Multi-stakeholder perspective considering investors, regulators, and community impact."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Continuous monitoring and updates to ensure the most current ESG intelligence."
    }
  ];

  const methodology = [
    {
      step: "1",
      title: "Data Collection",
      description: "Aggregate ESG data from multiple reliable sources including corporate reports, news, and regulatory filings."
    },
    {
      step: "2", 
      title: "Feature Engineering",
      description: "Transform raw ESG data into meaningful features that capture risk patterns and sustainability metrics."
    },
    {
      step: "3",
      title: "Model Training",
      description: "Train ensemble models using Random Forest and other algorithms to predict ESG risk scores."
    },
    {
      step: "4",
      title: "Validation",
      description: "Rigorous backtesting and cross-validation to ensure model accuracy and reliability."
    },
    {
      step: "5",
      title: "Monitoring",
      description: "Continuous model monitoring and retraining to maintain performance as market conditions evolve."
    }
  ];

  const technologies = [
    { name: "FastAPI", description: "High-performance Python web framework" },
    { name: "scikit-learn", description: "Machine learning library for risk modeling" },
    { name: "React", description: "Modern frontend framework for interactive UI" },
    { name: "TypeScript", description: "Type-safe development for reliability" },
    { name: "TanStack Query", description: "Powerful data fetching and caching" },
    { name: "ShadCN UI", description: "Accessible and customizable components" }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              About ESG Analytics Platform
            </h1>
            <p className="text-lg text-foreground-secondary max-w-3xl mx-auto">
              Advanced ESG risk analysis platform powered by artificial intelligence, 
              providing comprehensive sustainability insights for informed investment decisions.
            </p>
          </div>

          {/* Key Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Methodology */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Methodology</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {methodology.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Model Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">AI Model Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {modelLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : modelInfo ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Algorithm</span>
                        <Badge variant="outline">Random Forest Classifier</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Model Version</span>
                        <Badge className="bg-green-100 text-green-800">
                          v{modelInfo.version}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Features</span>
                        <Badge variant="outline">{modelInfo.features.length} variables</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Framework</span>
                        <Badge variant="outline">scikit-learn {modelInfo.sklearn_version_runtime}</Badge>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>Model information is currently unavailable.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">ESG Risk Score Prediction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Sector-wise Risk Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Company Performance Ranking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Controversy Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Feature Importance Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Batch Processing Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Technology Stack</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Built With Modern Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {technologies.map((tech, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h4 className="font-semibold mb-1">{tech.name}</h4>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Sources & Disclaimers */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Corporate ESG reports and sustainability disclosures</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Regulatory filings and compliance data</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Third-party ESG rating agencies</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">News and media monitoring for controversies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Important Disclaimers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      This platform provides ESG risk analysis for informational purposes only. 
                      It should not be considered as investment advice.
                    </p>
                    <p>
                      ESG scores and predictions are based on available data and may not reflect 
                      all relevant factors affecting company performance.
                    </p>
                    <p>
                      Users should conduct their own due diligence and consult financial 
                      advisors before making investment decisions.
                    </p>
                    <p>
                      Data accuracy and model performance may vary. Results should be 
                      validated with additional research.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contact & Support */}
          <section>
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Explore our comprehensive ESG analytics platform and discover how AI-powered 
                  insights can enhance your sustainability strategy and investment decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Badge variant="outline" className="px-4 py-2">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    <Code className="h-4 w-4 mr-2" />
                    API Reference
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    <Users className="h-4 w-4 mr-2" />
                    Support
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;