import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  TrendingUp,
  Leaf,
  Users,
  Scale,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Label,
  Badge,
  Progress,
  Slider,
  Spinner,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { RadarChart } from '@/components/charts';
import { useMutation } from '@/hooks';
import { apiService } from '@/services/api';
import { cn, getRiskColor } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const resultVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.9 },
};

// Types
interface PredictionInput {
  environment_risk_score: number;
  social_risk_score: number;
  governance_risk_score: number;
  controversy_score: number;
}

interface PredictionResult {
  risk_level: string;
  confidence: number;
  total_score: number;
  recommendations?: string[];
}

// Score Input Component - Isolated
interface ScoreInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  color: string;
  min?: number;
  max?: number;
}

const ScoreInput = memo(function ScoreInput({
  label,
  description,
  value,
  onChange,
  icon,
  color,
  min = 0,
  max = 50,
}: ScoreInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            className="w-20 h-8 text-center"
            min={min}
            max={max}
          />
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={0.1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} (Best)</span>
        <span>{max} (Worst)</span>
      </div>
    </div>
  );
});

// Result Card Component - Isolated
const ResultCard = memo(function ResultCard({
  result,
  inputs,
  onReset,
}: {
  result: PredictionResult;
  inputs: PredictionInput;
  onReset: () => void;
}) {
  const riskColor = getRiskColor(result.risk_level);

  const radarData = [
    { metric: 'Environment', value: inputs.environment_risk_score },
    { metric: 'Social', value: inputs.social_risk_score },
    { metric: 'Governance', value: inputs.governance_risk_score },
    { metric: 'Controversy', value: inputs.controversy_score },
  ];

  const getRiskIcon = () => {
    if (result.risk_level === 'Low') return <CheckCircle2 className="h-12 w-12" />;
    if (result.risk_level === 'Medium') return <Info className="h-12 w-12" />;
    return <AlertTriangle className="h-12 w-12" />;
  };

  const recommendations = result.recommendations || [
    'Continue monitoring ESG metrics regularly',
    'Consider industry benchmarking for comparison',
    'Review governance policies annually',
    'Engage with stakeholders on sustainability initiatives',
  ];

  return (
    <motion.div
      variants={resultVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Main Result */}
      <Card className="border-2" style={{ borderColor: riskColor }}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center h-20 w-20 rounded-full mb-4"
              style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
            >
              {getRiskIcon()}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {result.risk_level} Risk Level
            </h3>
            <p className="text-muted-foreground">
              Based on the provided ESG metrics
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold" style={{ color: riskColor }}>
                  {result.total_score.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Total Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-primary">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart
              data={radarData}
              radars={[{ key: 'value', name: 'Score', color: riskColor }]}
              angleKey="metric"
              height={250}
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* Score Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  Environment
                </span>
                <span className="font-semibold">
                  {inputs.environment_risk_score.toFixed(1)}
                </span>
              </div>
              <Progress
                value={(inputs.environment_risk_score / 50) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Social
                </span>
                <span className="font-semibold">{inputs.social_risk_score.toFixed(1)}</span>
              </div>
              <Progress
                value={(inputs.social_risk_score / 50) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-500" />
                  Governance
                </span>
                <span className="font-semibold">
                  {inputs.governance_risk_score.toFixed(1)}
                </span>
              </div>
              <Progress
                value={(inputs.governance_risk_score / 50) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Controversy
                </span>
                <span className="font-semibold">{inputs.controversy_score.toFixed(1)}</span>
              </div>
              <Progress
                value={(inputs.controversy_score / 5) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onReset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Make Another Prediction
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

// Main Predictor Page
function Predictor() {
  const [inputs, setInputs] = useState<PredictionInput>({
    environment_risk_score: 15,
    social_risk_score: 12,
    governance_risk_score: 10,
    controversy_score: 2,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);

  // Prediction mutation
  const prediction = useMutation<PredictionResult, PredictionInput>(
    async (data) => {
      const response = await apiService.predictRisk(data);
      return response;
    },
    {
      onSuccess: (data) => {
        setResult(data);
      },
    }
  );

  const updateInput = useCallback(
    (key: keyof PredictionInput) => (value: number) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      prediction.mutate(inputs);
    },
    [inputs, prediction]
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setInputs({
      environment_risk_score: 15,
      social_risk_score: 12,
      governance_risk_score: 10,
      controversy_score: 2,
    });
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">ESG Risk Predictor</h1>
        <p className="text-muted-foreground">
          Use our AI-powered model to predict ESG risk levels based on company metrics.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {result ? (
          <ResultCard
            key="result"
            result={result}
            inputs={inputs}
            onReset={handleReset}
          />
        ) : (
          <motion.div
            key="form"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Enter ESG Metrics
                  </CardTitle>
                  <CardDescription>
                    Adjust the sliders or input values directly to predict risk level.
                    Lower scores indicate better performance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <ScoreInput
                    label="Environment Risk Score"
                    description="Environmental impact and sustainability practices"
                    value={inputs.environment_risk_score}
                    onChange={updateInput('environment_risk_score')}
                    icon={<Leaf className="h-4 w-4" />}
                    color="#10b981"
                    max={50}
                  />

                  <ScoreInput
                    label="Social Risk Score"
                    description="Labor practices, community relations, human rights"
                    value={inputs.social_risk_score}
                    onChange={updateInput('social_risk_score')}
                    icon={<Users className="h-4 w-4" />}
                    color="#3b82f6"
                    max={50}
                  />

                  <ScoreInput
                    label="Governance Risk Score"
                    description="Corporate governance, ethics, transparency"
                    value={inputs.governance_risk_score}
                    onChange={updateInput('governance_risk_score')}
                    icon={<Scale className="h-4 w-4" />}
                    color="#8b5cf6"
                    max={50}
                  />

                  <ScoreInput
                    label="Controversy Score"
                    description="Level of ESG-related controversies (0-5)"
                    value={inputs.controversy_score}
                    onChange={updateInput('controversy_score')}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color="#f97316"
                    max={5}
                  />
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={prediction.isLoading}
                    className="w-full sm:w-auto"
                  >
                    {prediction.isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Predict Risk Level
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Values
                  </Button>
                </CardFooter>
              </Card>
            </form>

            {/* Error display */}
            {prediction.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Prediction Failed</p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.error?.message || 'An error occurred while processing your request.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About the Prediction Model
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Our ESG risk prediction model uses machine learning to analyze
                  environmental, social, and governance metrics to estimate overall
                  risk levels.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <Badge className="bg-green-500 mb-2">Low</Badge>
                    <p className="text-xs">Score &lt; 20</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                    <Badge className="bg-yellow-500 mb-2">Medium</Badge>
                    <p className="text-xs">Score 20-30</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-500/10">
                    <Badge className="bg-orange-500 mb-2">High</Badge>
                    <p className="text-xs">Score 30-40</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-500/10">
                    <Badge className="bg-red-500 mb-2">Severe</Badge>
                    <p className="text-xs">Score &gt; 40</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(Predictor);
