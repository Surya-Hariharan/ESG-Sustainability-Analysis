import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock company data with ESG scores
  const companies = [
    {
      id: 1,
      name: 'Tesla Inc.',
      sector: 'Automotive',
      esgScore: 87,
      trend: 'up',
      environment: 92,
      social: 78,
      governance: 91,
      riskLevel: 'Low',
    },
    {
      id: 2,
      name: 'Apple Inc.',
      sector: 'Technology',
      esgScore: 91,
      trend: 'up',
      environment: 88,
      social: 95,
      governance: 90,
      riskLevel: 'Low',
    },
    {
      id: 3,
      name: 'Microsoft Corporation',
      sector: 'Technology',
      esgScore: 89,
      trend: 'stable',
      environment: 90,
      social: 87,
      governance: 90,
      riskLevel: 'Low',
    },
    {
      id: 4,
      name: 'ExxonMobil',
      sector: 'Energy',
      esgScore: 54,
      trend: 'down',
      environment: 45,
      social: 62,
      governance: 56,
      riskLevel: 'High',
    },
    {
      id: 5,
      name: 'Johnson & Johnson',
      sector: 'Healthcare',
      esgScore: 82,
      trend: 'up',
      environment: 79,
      social: 88,
      governance: 79,
      riskLevel: 'Medium',
    },
    {
      id: 6,
      name: 'Amazon.com Inc.',
      sector: 'E-commerce',
      esgScore: 75,
      trend: 'up',
      environment: 71,
      social: 74,
      governance: 80,
      riskLevel: 'Medium',
    },
  ];

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-[#9EFFCD] to-[#6BFFEA]';
    if (score >= 60) return 'from-[#FFD700] to-[#FFA500]';
    return 'from-[#FF6B6B] to-[#FF4757]';
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, string> = {
      Low: 'bg-[#9EFFCD]/20 text-[#9EFFCD] border-[#9EFFCD]/30',
      Medium: 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30',
      High: 'bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/30',
    };
    return variants[risk] || variants.Low;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-[#9EFFCD]" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-[#FF6B6B]" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

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
            text="Company ESG Ratings"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore comprehensive ESG scores and sustainability metrics for leading global companies
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/40 border-white/10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-[#9429FF] to-[#9EFFCD]">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{company.sector}</p>
                      </div>
                    </div>
                    {getTrendIcon(company.trend)}
                  </div>
                  <Badge className={getRiskBadge(company.riskLevel)} variant="outline">
                    {company.riskLevel} Risk
                  </Badge>
                </CardHeader>
                <CardContent>
                  {/* Overall ESG Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">ESG Score</span>
                      <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(company.esgScore)} bg-clip-text text-transparent`}>
                        {company.esgScore}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${company.esgScore}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${getScoreColor(company.esgScore)}`}
                      />
                    </div>
                  </div>

                  {/* Individual Scores */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Environmental</span>
                      <span className="font-medium">{company.environment}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Social</span>
                      <span className="font-medium">{company.social}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Governance</span>
                      <span className="font-medium">{company.governance}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No companies found matching your search.</p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default Companies;
