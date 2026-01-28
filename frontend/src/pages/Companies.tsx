import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';
import { api, type Company } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getTopCompanies(100);
        setCompanies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    // Lower ESG risk score is better (0 = best, 100 = worst)
    if (score <= 20) return 'from-[#9EFFCD] to-[#6BFFEA]';
    if (score <= 40) return 'from-[#FFD700] to-[#FFA500]';
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner className="h-12 w-12" />
            <span className="ml-4 text-lg">Loading companies...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="backdrop-blur-xl bg-background/60 border-red-500/30 p-8 text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {/* Company Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => {
              const score = company.total_esg_risk_score || 0;
              const riskLevel = score <= 20 ? 'Low' : score <= 40 ? 'Medium' : 'High';
              return (
                <motion.div
                  key={company.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
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
                        <span className="text-xs text-muted-foreground font-mono">{company.symbol}</span>
                      </div>
                      <Badge className={getRiskBadge(riskLevel)} variant="outline">
                        {riskLevel} Risk
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {/* Overall ESG Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ESG Risk Score</span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, score)}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                            className={`h-full bg-gradient-to-r ${getScoreColor(score)}`}
                          />
                        </div>
                      </div>

                      {/* Sector Info */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sector</span>
                          <span className="font-medium text-[#9EFFCD]">{company.sector}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredCompanies.length === 0 && (
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
