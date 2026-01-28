import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';
import { api, type ControversyCompany } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';

const Controversies = () => {
  const [controversies, setControversies] = useState<ControversyCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControversies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getControversies(50); // Min score 50
        setControversies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load controversies');
      } finally {
        setLoading(false);
      }
    };

    fetchControversies();
  }, []);

  const getSeverityConfig = (score: number) => {
    if (score >= 80) {
      return {
        icon: AlertTriangle,
        color: 'text-[#FF4757]',
        bg: 'bg-[#FF4757]/20 border-[#FF4757]/30',
        label: 'Severe'
      };
    } else if (score >= 60) {
      return {
        icon: AlertCircle,
        color: 'text-[#FF6B6B]',
        bg: 'bg-[#FF6B6B]/20 border-[#FF6B6B]/30',
        label: 'High'
      };
    } else {
      return {
        icon: AlertCircle,
        color: 'text-[#FFD700]',
        bg: 'bg-[#FFD700]/20 border-[#FFD700]/30',
        label: 'Medium'
      };
    }
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
            text="ESG Controversies"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track and monitor ESG-related controversies across global companies
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner className="h-12 w-12" />
            <span className="ml-4 text-lg">Loading controversies...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="backdrop-blur-xl bg-background/60 border-red-500/30 p-8 text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {/* Controversies Grid */}
        {!loading && !error && (
          <div className="grid gap-6">
            {controversies.map((controversy, index) => {
              const config = getSeverityConfig(controversy.controversy_score);
              const Icon = config.icon;

              return (
                <motion.div
                  key={`${controversy.symbol}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{controversy.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {controversy.symbol}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge className={config.bg} variant="outline">
                                {config.label} - Score: {controversy.controversy_score.toFixed(1)}
                              </Badge>
                              {controversy.controversy_level && (
                                <span className="capitalize">{controversy.controversy_level}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{controversy.name}</span>
                        </div>
                        <div className={`text-sm font-semibold ${config.color}`}>
                          Controversy Score: {controversy.controversy_score.toFixed(1)}
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
        {!loading && !error && controversies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No high-controversy companies found.</p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
};

export default Controversies;
