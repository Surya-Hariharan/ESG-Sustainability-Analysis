import { motion } from 'framer-motion';
import { Target, Users, Zap, Shield, Award, Github, Linkedin, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Democratize ESG analytics and empower stakeholders with data-driven sustainability insights',
      color: 'from-[#9429FF] to-[#B76EFF]',
    },
    {
      icon: Shield,
      title: 'Transparency',
      description: 'Provide accurate, unbiased sustainability assessments based on verified data and proven methodologies',
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leverage cutting-edge AI and machine learning to predict ESG risks and identify opportunities',
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
    },
  ];

  const techStack = [
    { name: 'React 18', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'PyTorch', category: 'Machine Learning' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'TailwindCSS', category: 'Styling' },
    { name: 'Three.js', category: '3D Graphics' },
    { name: 'Redis', category: 'Caching' },
  ];

  const stats = [
    { value: '10,000+', label: 'Companies Analyzed' },
    { value: '50+', label: 'Industries Covered' },
    { value: '95%', label: 'ML Accuracy' },
    { value: '24/7', label: 'Data Updates' },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <BlurText
            text="About ESG Analytics"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforming sustainability analysis through artificial intelligence and comprehensive data analytics
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-background/60 border-white/10 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.color} mb-4`}>
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                    className="p-4 rounded-lg bg-background/40 text-center hover:bg-background/60 transition-colors"
                  >
                    <p className="font-semibold text-sm">{tech.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tech.category}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="backdrop-blur-xl bg-gradient-to-r from-[#9429FF]/10 to-[#9EFFCD]/10 border-white/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Have questions or want to collaborate? We'd love to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90" asChild>
                  <a href="mailto:contact@esg-analytics.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default About;
