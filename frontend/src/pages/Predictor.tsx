import Sidebar from '@/components/Sidebar';
import { useESGPrediction, useFeatureImportances, useModelInfo } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Predictor = () => {
  const { toast } = useToast();
  const { mutate: predict, isPending, data: prediction, error } = useESGPrediction();
  const { data: featureImportances, isLoading: loadingImportances } = useFeatureImportances();
  const { data: modelInfo, isLoading: loadingModel } = useModelInfo();

  const [formData, setFormData] = useState({
    environment_risk_score: '',
    social_risk_score: '',
    governance_risk_score: '',
    controversy_score: '',
    full_time_employees: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const numericData = {
      environment_risk_score: parseFloat(formData.environment_risk_score),
      social_risk_score: parseFloat(formData.social_risk_score),
      governance_risk_score: parseFloat(formData.governance_risk_score),
      controversy_score: parseFloat(formData.controversy_score),
      full_time_employees: parseFloat(formData.full_time_employees)
    };

    // Check for valid numbers
    for (const [key, value] of Object.entries(numericData)) {
      if (isNaN(value) || value < 0) {
        toast({
          title: "Invalid Input",
          description: `Please enter a valid positive number for ${key.replace(/_/g, ' ')}.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Additional validation for risk scores (0-100)
    const riskScores = ['environment_risk_score', 'social_risk_score', 'governance_risk_score', 'controversy_score'];
    for (const field of riskScores) {
      const value = numericData[field as keyof typeof numericData];
      if (value > 100) {
        toast({
          title: "Invalid Range",
          description: `${field.replace(/_/g, ' ')} should be between 0 and 100.`,
          variant: "destructive"
        });
        return;
      }
    }

    predict(numericData, {
      onSuccess: (result) => {
        toast({
          title: "Prediction Complete",
          description: `ESG Risk Level: ${result.risk_level} (${(result.probability * 100).toFixed(1)}% confidence)`,
        });
      },
      onError: (error) => {
        toast({
          title: "Prediction Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleReset = () => {
    setFormData({
      environment_risk_score: '',
      social_risk_score: '',
      governance_risk_score: '',
      controversy_score: '',
      full_time_employees: ''
    });
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
      case 'very low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
      case 'severe':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getConfidenceColor = (probability: number) => {
    if (probability > 0.8) return 'text-green-600';
    if (probability > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              ESG Risk Predictor
            </h1>
            <p className="text-lg text-foreground-secondary">
              AI-powered ESG risk prediction using machine learning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prediction Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Risk Assessment Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="environment_risk_score">
                          Environment Risk Score (0-100)
                        </Label>
                        <Input
                          id="environment_risk_score"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 25.5"
                          value={formData.environment_risk_score}
                          onChange={(e) => handleInputChange('environment_risk_score', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="social_risk_score">
                          Social Risk Score (0-100)
                        </Label>
                        <Input
                          id="social_risk_score"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 30.0"
                          value={formData.social_risk_score}
                          onChange={(e) => handleInputChange('social_risk_score', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="governance_risk_score">
                          Governance Risk Score (0-100)
                        </Label>
                        <Input
                          id="governance_risk_score"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 20.0"
                          value={formData.governance_risk_score}
                          onChange={(e) => handleInputChange('governance_risk_score', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="controversy_score">
                          Controversy Score (0-100)
                        </Label>
                        <Input
                          id="controversy_score"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 5.0"
                          value={formData.controversy_score}
                          onChange={(e) => handleInputChange('controversy_score', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="full_time_employees">
                          Full Time Employees
                        </Label>
                        <Input
                          id="full_time_employees"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g., 10000"
                          value={formData.full_time_employees}
                          onChange={(e) => handleInputChange('full_time_employees', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1"
                      >
                        {isPending ? 'Predicting...' : 'Predict ESG Risk'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Prediction Result */}
              {prediction && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Prediction Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Risk Level:</span>
                        <Badge variant={getRiskBadgeVariant(prediction.risk_level)} className="text-lg px-3 py-1">
                          {prediction.risk_level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Confidence:</span>
                        <span className={`text-xl font-bold ${getConfidenceColor(prediction.probability)}`}>
                          {(prediction.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Model Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Model Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingModel ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : modelInfo ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Classes:</strong> {modelInfo.classes.join(', ')}
                      </div>
                      <div>
                        <strong>Features:</strong> {modelInfo.features.length}
                      </div>
                      <div>
                        <strong>Runtime Version:</strong> {modelInfo.sklearn_version_runtime}
                      </div>
                      <div>
                        <strong>Last Updated:</strong> {new Date(modelInfo.generated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Model information unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* Feature Importances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Feature Importance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingImportances ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : featureImportances?.feature_importances ? (
                    <div className="space-y-3">
                      {Object.entries(featureImportances.feature_importances)
                        .sort(([, a], [, b]) => b - a)
                        .map(([feature, importance]) => (
                          <div key={feature} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">
                                {feature.replace(/_/g, ' ')}
                              </span>
                              <span className="font-medium">
                                {(importance * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${importance * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Feature importance data unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Predictor;