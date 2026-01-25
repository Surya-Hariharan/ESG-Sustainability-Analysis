import { motion } from 'framer-motion';
import { Factory, Zap, Heart, Building2, Truck, Cpu, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const Sectors = () => {
  const sectors = [
    {
      id: 1,
      name: 'Technology',
      icon: Cpu,
      avgScore: 85,
      companies: 1245,
      trend: '+5.2%',
      color: 'from-[#9429FF] to-[#B76EFF]',
      performance: {
        environment: 82,
        social: 88,
        governance: 85,
      },
    },
    {
      id: 2,
      name: 'Healthcare',
      icon: Heart,
      avgScore: 78,
      companies: 892,
      trend: '+3.8%',
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
      performance: {
        environment: 75,
        social: 83,
        governance: 76,
      },
    },
    {
      id: 3,
      name: 'Manufacturing',
      icon: Factory,
      avgScore: 65,
      companies: 2156,
      trend: '+2.1%',
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
      performance: {
        environment: 62,
        social: 68,
        governance: 65,
      },
    },
    {
      id: 4,
      name: 'Energy',
      icon: Zap,
      avgScore: 58,
      companies: 543,
      trend: '-1.5%',
      color: 'from-[#FFD700] to-[#FFA500]',
      performance: {
        environment: 48,
        social: 65,
        governance: 61,
      },
    },
    {
      id: 5,
      name: 'Real Estate',
      icon: Building2,
      avgScore: 72,
      companies: 1087,
      trend: '+4.3%',
      color: 'from-[#9429FF] to-[#9EFFCD]',
      performance: {
        environment: 70,
        social: 74,
        governance: 72,
      },
    },
    {
      id: 6,
      name: 'Transportation',
      icon: Truck,
      avgScore: 61,
      companies: 678,
      trend: '+1.9%',
      color: 'from-[#7AFFCD] to-[#6BFFEA]',
      performance: {
        environment: 55,
        social: 64,
        governance: 64,
      },
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#9EFFCD]';
    if (score >= 60) return 'text-[#FFD700]';
    return 'text-[#FF6B6B]';
  };

  const topPerformers = [
    { name: 'Apple Inc.', sector: 'Technology', score: 91 },
    { name: 'Microsoft Corp.', sector: 'Technology', score: 89 },
    { name: 'Tesla Inc.', sector: 'Automotive', score: 87 },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <BlurText
            text="Industry Sector Analysis"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare ESG performance across industries and discover sector-wide sustainability trends
          </p>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#9EFFCD]" />
                <CardTitle>Top ESG Performers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((company, index) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/40 hover:bg-background/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.sector}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[#9EFFCD] to-[#6BFFEA] bg-clip-text text-transparent">
                      {company.score}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sector Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${sector.color}`}>
                      <sector.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-[#9EFFCD]" />
                      <span className="text-[#9EFFCD] font-medium">{sector.trend}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{sector.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{sector.companies} Companies</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Average Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average ESG Score</span>
                      <span className={`text-3xl font-bold ${getScoreColor(sector.avgScore)}`}>
                        {sector.avgScore}
                      </span>
                    </div>
                  </div>

                  {/* ESG Breakdown */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Environmental</span>
                        <span className="font-medium">{sector.performance.environment}%</span>
                      </div>
                      <Progress value={sector.performance.environment} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Social</span>
                        <span className="font-medium">{sector.performance.social}%</span>
                      </div>
                      <Progress value={sector.performance.social} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Governance</span>
                        <span className="font-medium">{sector.performance.governance}%</span>
                      </div>
                      <Progress value={sector.performance.governance} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Sectors;
