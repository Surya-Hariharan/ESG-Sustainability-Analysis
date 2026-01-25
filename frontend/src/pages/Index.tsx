import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LightPillar from '@/components/LightPillar';

const Index = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'ESG Analytics',
      description: 'Comprehensive environmental, social, and governance metrics analysis',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'AI-powered risk prediction and controversy detection',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: BarChart3,
      title: 'Sector Insights',
      description: 'Industry-wide comparisons and benchmarking',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Up-to-date company performance and sustainability scores',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Companies Analyzed' },
    { value: '95%', label: 'Prediction Accuracy' },
    { value: '50+', label: 'Industries Covered' },
    { value: '24/7', label: 'Real-time Monitoring' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Light Pillar */}
      <div className="fixed inset-0 z-0 opacity-30">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Content Wrapper - properly isolated from background */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                ESG Sustainability
                <br />
                Analytics Platform
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Unlock powerful insights into corporate sustainability performance with AI-driven
                analytics and comprehensive ESG metrics
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/companies">
                  <Button size="lg" className="rounded-full px-8 group">
                    Explore Companies
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/predictor">
                  <Button size="lg" variant="outline" className="rounded-full px-8">
                    Try Risk Predictor
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Powerful Features for
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {' '}
                  Sustainable Insights
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to make informed decisions about corporate sustainability
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white group-hover:scale-110 transition-transform`}
                        >
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-secondary/10 border-white/20">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Transform Your ESG Analysis?
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Start exploring comprehensive sustainability data and AI-powered insights today
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/sectors">
                      <Button size="lg" className="rounded-full px-8">
                        View Sector Analytics
                      </Button>
                    </Link>
                    <Link to="/about">
                      <Button size="lg" variant="outline" className="rounded-full px-8">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10 backdrop-blur-xl bg-background/60">
          <div className="max-w-6xl mx-auto text-center text-muted-foreground">
            <p>&copy; 2026 ESG Analytics Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
