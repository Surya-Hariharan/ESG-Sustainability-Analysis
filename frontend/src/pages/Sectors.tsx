import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';
import { api, type SectorAverage } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

const Sectors = () => {
  const [sectors, setSectors] = useState<SectorAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getSectorAverages();
        setSectors(data);
      } catch (err: any) {
        // Ignore cancellation errors from React Strict Mode
        if (err.message && err.message.includes('canceled')) return;

        setError(err.message || 'Failed to load sector data');
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'from-[#9EFFCD] to-[#6BFFEA]';
    if (score <= 40) return 'from-[#FFD700] to-[#FFA500]';
    return 'from-[#FF6B6B] to-[#FF4757]';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 20) return 'Low';
    if (score <= 40) return 'Medium';
    return 'High';
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
            text="Sector ESG Analysis"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive ESG performance analysis across industry sectors
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner className="h-12 w-12" />
            <span className="ml-4 text-lg">Loading sector data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="backdrop-blur-xl bg-background/60 border-red-500/30 p-8 text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {/* Sectors Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, index) => {
              const score = sector.avg_esg_score || 0;
              const riskLevel = getRiskLevel(score);
              return (
                <motion.div
                  key={sector.sector}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getScoreColor(score)}`}>
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{sector.sector}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {sector.company_count} companies
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Average ESG Score */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Average ESG Risk</span>
                          <span className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, score)}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${getScoreColor(score)}`}
                          />
                        </div>
                      </div>

                      {/* Risk Level Badge */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-sm text-muted-foreground">Risk Level</span>
                        <span className={`text-sm font-semibold ${riskLevel === 'Low' ? 'text-[#9EFFCD]' :
                          riskLevel === 'Medium' ? 'text-[#FFD700]' :
                            'text-[#FF6B6B]'
                          }`}>
                          {riskLevel}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && sectors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No sector data available.</p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default Sectors;
