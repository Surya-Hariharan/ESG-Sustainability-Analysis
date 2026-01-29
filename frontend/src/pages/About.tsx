import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Target, Zap, Shield, Github, Linkedin, Mail,
  TrendingUp, Award, Sparkles, BarChart3,
  Brain, ArrowRight, Heart, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';
import { useRef } from 'react';

const About = () => {
  const [activeTimeline, setActiveTimeline] = useState(0);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Democratize ESG analytics and empower stakeholders with data-driven sustainability insights',
      color: 'from-[#9429FF] to-[#B76EFF]',
      features: ['Global Impact', 'Data Transparency', 'Stakeholder Empowerment'],
    },
    {
      icon: Shield,
      title: 'Transparency',
      description: 'Provide accurate, unbiased sustainability assessments based on verified data and proven methodologies',
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
      features: ['Verified Data', 'Open Methodology', 'Third-party Audits'],
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leverage cutting-edge AI and machine learning to predict ESG risks and identify opportunities',
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
      features: ['AI-Powered', 'Predictive Analytics', 'Real-time Insights'],
    },
  ];

  const techStack = [
    { name: 'React 18', category: 'Frontend', icon: BarChart3, color: 'from-[#61DAFB] to-[#4A9ECC]' },
    { name: 'TypeScript', category: 'Language', icon: BarChart3, color: 'from-[#3178C6] to-[#235A97]' },
    { name: 'FastAPI', category: 'Backend', icon: Zap, color: 'from-[#009688] to-[#00695C]' },
    { name: 'PyTorch', category: 'Machine Learning', icon: Brain, color: 'from-[#EE4C2C] to-[#C43A1F]' },
    { name: 'PostgreSQL', category: 'Database', icon: BarChart3, color: 'from-[#336791] to-[#254B6D]' },
    { name: 'TailwindCSS', category: 'Styling', icon: Sparkles, color: 'from-[#06B6D4] to-[#0891B2]' },
    { name: 'Three.js', category: '3D Graphics', icon: Sparkles, color: 'from-[#000000] to-[#333333]' },
    { name: 'Redis', category: 'Caching', icon: Zap, color: 'from-[#DC382D] to-[#A82822]' },
  ];

  const stats = [
    { value: 10000, label: 'Companies Analyzed', suffix: '+', icon: Building2, color: 'from-[#9429FF] to-[#B76EFF]' },
    { value: 50, label: 'Industries Covered', suffix: '+', icon: TrendingUp, color: 'from-[#6B9EFF] to-[#9EFFCD]' },
    { value: 95, label: 'ML Accuracy', suffix: '%', icon: Brain, color: 'from-[#9EFFCD] to-[#6BFFEA]' },
    { value: 24, label: 'Data Updates', suffix: '/7', icon: TrendingUp, color: 'from-[#FFD700] to-[#FFA500]' },
  ];

  const timeline = [
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'Launched comprehensive ESG analytics platform with AI-powered insights',
      icon: TrendingUp,
      color: 'from-[#9429FF] to-[#B76EFF]',
    },
    {
      year: '2023',
      title: 'ML Model Development',
      description: 'Developed proprietary machine learning models for ESG prediction',
      icon: Brain,
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
    },
    {
      year: '2022',
      title: 'Data Collection',
      description: 'Built comprehensive ESG data infrastructure covering global markets',
      icon: BarChart3,
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
    },
    {
      year: '2021',
      title: 'Foundation',
      description: 'Established with mission to democratize sustainability analytics',
      icon: Award,
      color: 'from-[#FFD700] to-[#FFA500]',
    },
  ];

  const team = [
    {
      role: 'Data Scientists',
      count: '15+',
      description: 'PhD-level experts in ML and sustainability',
      icon: Brain,
      color: 'from-[#9429FF] to-[#B76EFF]',
    },
    {
      role: 'Engineers',
      count: '20+',
      description: 'Full-stack developers and DevOps specialists',
      icon: BarChart3,
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
    },
    {
      role: 'ESG Analysts',
      count: '10+',
      description: 'Certified sustainability professionals',
      icon: Award,
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
    },
  ];

  // Animated counter hook
  const useCounter = (end: number, duration: number = 2000, shouldStart: boolean) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!shouldStart) return;

      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, shouldStart]);

    return count;
  };

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

        {/* Animated Stats */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const count = useCounter(stat.value, 2000, isStatsInView);

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {isStatsInView ? count : 0}{stat.suffix}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] bg-clip-text text-transparent">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#9429FF] via-[#6B9EFF] to-[#9EFFCD] hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onViewportEnter={() => setActiveTimeline(index)}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className={`backdrop-blur-xl bg-background/60 border-white/10 hover:border-white/30 transition-all duration-300 ${activeTimeline === index ? 'scale-105 shadow-2xl' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {index % 2 === 0 && (
                            <>
                              <div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.year}</p>
                              </div>
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} ml-auto`}>
                                <item.icon className="h-5 w-5 text-white" />
                              </div>
                            </>
                          )}
                          {index % 2 !== 0 && (
                            <>
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                                <item.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.year}</p>
                              </div>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:block relative z-10">
                    <motion.div
                      animate={{
                        scale: activeTimeline === index ? 1.5 : 1,
                        boxShadow: activeTimeline === index ? '0 0 20px rgba(148, 41, 255, 0.5)' : 'none',
                      }}
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color} border-4 border-background`}
                    />
                  </div>

                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Core Values with Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="backdrop-blur-xl bg-background/60 border-white/10 h-full hover:border-white/30 transition-all duration-300 group overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.color} mb-4 shadow-lg`}
                    >
                      <value.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{value.description}</p>
                    <div className="space-y-2">
                      {value.features.map((feature, i) => (
                        <div key={i} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-[#9EFFCD]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:border-white/30 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${member.color} mb-4`}>
                      <member.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-2`}>
                      {member.count}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{member.role}</h3>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack with Enhanced Hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-[#9EFFCD]" />
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="relative group"
                  >
                    <div className="p-4 rounded-lg bg-background/40 hover:bg-background/60 transition-all duration-300 border border-white/5 hover:border-white/20 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <tech.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <p className="font-semibold text-sm text-center">{tech.name}</p>
                        <p className="text-xs text-muted-foreground text-center mt-1">{tech.category}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-gradient-to-r from-[#9429FF]/10 to-[#9EFFCD]/10 border-white/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9429FF]/5 via-transparent to-[#9EFFCD]/5" />
            <CardContent className="p-12 text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex p-4 rounded-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] mb-6"
              >
                <Heart className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Have questions or want to collaborate? We'd love to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90 group" asChild>
                  <a href="mailto:contact@esg-analytics.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="hover:bg-white/10" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="hover:bg-white/10" asChild>
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
