import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LightPillar from '@/components/LightPillar';
import Footer from '@/components/Footer';
import BlurText from '@/components/BlurText';
import TextType from '@/components/TextType';

const Index = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'ESG Analytics',
      description: 'Comprehensive environmental, social, and governance metrics analysis',
      color: 'from-[#9429FF] to-[#B76EFF]',
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'AI-powered risk prediction and controversy detection',
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
    },
    {
      icon: BarChart3,
      title: 'Sector Insights',
      description: 'Industry-wide comparisons and benchmarking',
      color: 'from-[#9429FF] to-[#9EFFCD]',
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Up-to-date company performance and sustainability scores',
      color: 'from-[#7AFFCD] to-[#6BFFEA]',
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
          topColor="#9429FF"
          bottomColor="#9EFFCD"
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
              <BlurText
                text="ESG Sustainability Analytics Platform"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent"
              />
              <div className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto min-h-[80px] flex items-center justify-center">
                <TextType 
                  text={[
                    "Unlock powerful insights into corporate sustainability performance",
                    "AI-driven analytics and comprehensive ESG metrics",
                    "Make informed decisions about corporate sustainability",
                    "Transform your ESG analysis with cutting-edge technology"
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                  showCursor
                  cursorCharacter="|"
                  cursorBlinkDuration={0.7}
                  className="text-xl md:text-2xl"
                />
              </div>
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
                  className="h-full"
                >
                  <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group h-full">
                    <CardContent className="p-8 h-full">
                      <div className="flex items-start space-x-4 h-full">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white group-hover:scale-110 transition-transform flex-shrink-0`}
                        >
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden rounded-3xl">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent" />
                
                {/* Content */}
                <div className="relative backdrop-blur-xl bg-background/40 border border-white/10 p-12 md:p-16">
                  <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Ready to Transform Your ESG Analysis?
                      </h2>
                    </motion.div>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
                    >
                      Start exploring comprehensive sustainability data and AI-powered insights today
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                      <Link to="/sectors">
                        <Button 
                          size="lg" 
                          className="rounded-full px-10 py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 group"
                        >
                          View Sector Analytics
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to="/about">
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="rounded-full px-10 py-6 text-base font-semibold border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
