import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const Predictor = () => {
  const [formData, setFormData] = useState({
    environment: 75,
    social: 68,
    governance: 82,
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('');

  const handlePredict = () => {
    // Simple prediction logic (in real app, this would call ML API)
    const avgScore = Math.round(
      (formData.environment + formData.social + formData.governance) / 3
    );
    setPrediction(avgScore);

    if (avgScore >= 80) setRiskLevel('Low');
    else if (avgScore >= 60) setRiskLevel('Medium');
    else setRiskLevel('High');
  };

  const getRiskConfig = (level: string) => {
    const configs: Record<string, { color: string; icon: any; gradient: string }> = {
      Low: {
        color: 'text-[#9EFFCD]',
        icon: CheckCircle,
        gradient: 'from-[#9EFFCD] to-[#6BFFEA]',
      },
      Medium: {
        color: 'text-[#FFD700]',
        icon: AlertCircle,
        gradient: 'from-[#FFD700] to-[#FFA500]',
      },
      High: {
        color: 'text-[#FF6B6B]',
        icon: AlertCircle,
        gradient: 'from-[#FF6B6B] to-[#FF4757]',
      },
    };
    return configs[level] || configs.Medium;
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms trained on 10,000+ companies',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Insights',
      description: 'Forecast ESG risks before they impact your portfolio',
    },
    {
      icon: Sparkles,
      title: 'Real-time Scoring',
      description: 'Instant risk assessment based on latest sustainability metrics',
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <BlurText
            text="AI ESG Risk Predictor"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leverage cutting-edge AI to predict ESG risk levels and make data-driven sustainability decisions
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 text-center h-full">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex"
          >
            <Card className="backdrop-blur-xl bg-background/60 border-white/10 w-full flex flex-col">
              <CardHeader>
                <CardTitle>Input ESG Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Environmental Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Environmental Score</Label>
                    <span className="text-sm font-medium text-[#9EFFCD]">
                      {formData.environment}
                    </span>
                  </div>
                  <Slider
                    value={[formData.environment]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, environment: value[0] })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Social Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Social Score</Label>
                    <span className="text-sm font-medium text-[#9EFFCD]">
                      {formData.social}
                    </span>
                  </div>
                  <Slider
                    value={[formData.social]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, social: value[0] })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Governance Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Governance Score</Label>
                    <span className="text-sm font-medium text-[#9EFFCD]">
                      {formData.governance}
                    </span>
                  </div>
                  <Slider
                    value={[formData.governance]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, governance: value[0] })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handlePredict}
                  className="w-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90 text-white font-semibold"
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Predict Risk Level
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prediction Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex"
          >
            <Card className="backdrop-blur-xl bg-background/60 border-white/10 w-full flex flex-col">
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {prediction !== null ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Predicted Score */}
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-background/40 to-background/20">
                      <p className="text-sm text-muted-foreground mb-2">Predicted ESG Score</p>
                      <div className="text-6xl font-bold bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] bg-clip-text text-transparent mb-4">
                        {prediction}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const config = getRiskConfig(riskLevel);
                          const RiskIcon = config.icon;
                          return (
                            <>
                              <RiskIcon className={`h-5 w-5 ${config.color}`} />
                              <span className={`text-lg font-semibold ${config.color}`}>
                                {riskLevel} Risk
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Risk Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Risk Analysis</h4>
                      <div className="p-4 rounded-lg bg-background/40 space-y-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#9EFFCD] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Environmental Impact</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.environment >= 70
                                ? 'Strong environmental practices'
                                : 'Improvement needed in environmental metrics'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#9EFFCD] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Social Responsibility</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.social >= 70
                                ? 'Positive social impact score'
                                : 'Social initiatives require attention'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#9EFFCD] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Governance Structure</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.governance >= 70
                                ? 'Well-established governance framework'
                                : 'Governance practices need enhancement'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="p-4 rounded-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] mb-4">
                      <Brain className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-muted-foreground">
                      Adjust the ESG metrics and click "Predict Risk Level" to see your results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Predictor;
