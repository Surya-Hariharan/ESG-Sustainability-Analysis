import Sidebar from '@/components/Sidebar';
import { useHighControversyCompanies } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, AlertTriangle, Shield, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

const Controversies = () => {
  const [minScore, setMinScore] = useState([50]);
  const { data: companies, isLoading, error, refetch } = useHighControversyCompanies(minScore[0]);

  const getControversyLevel = (level: string) => {
    const lowerLevel = level?.toLowerCase() || '';
    if (lowerLevel.includes('high')) return { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' };
    if (lowerLevel.includes('moderate')) return { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' };
    if (lowerLevel.includes('low')) return { variant: 'default' as const, icon: Shield, color: 'text-green-600' };
    return { variant: 'outline' as const, icon: Eye, color: 'text-gray-600' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const sortedCompanies = companies ? [...companies].sort((a, b) => b.controversy_score - a.controversy_score) : [];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              Controversy Watch
            </h1>
            <p className="text-lg text-foreground-secondary">
              Companies with high ESG controversy scores
            </p>
          </div>

          {/* Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Filter Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Minimum Controversy Score</label>
                    <span className="text-sm font-bold bg-muted px-2 py-1 rounded">
                      {minScore[0]}
                    </span>
                  </div>
                  <Slider
                    value={minScore}
                    onValueChange={setMinScore}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setMinScore([30])}>
                    Low (30+)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMinScore([50])}>
                    Medium (50+)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMinScore([70])}>
                    High (70+)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load controversy data: {error.message}
                <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Companies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : sortedCompanies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Score ≥ {minScore[0]}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : sortedCompanies.length > 0 ? (
                    sortedCompanies[0].controversy_score.toFixed(1)
                  ) : (
                    'N/A'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum controversy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : sortedCompanies.length > 0 ? (
                    (sortedCompanies.reduce((sum, c) => sum + c.controversy_score, 0) / sortedCompanies.length).toFixed(1)
                  ) : (
                    'N/A'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Among filtered companies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Companies List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-6 w-16 ml-auto" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedCompanies.length > 0 ? (
            <div className="space-y-4">
              {sortedCompanies.map((company, index) => {
                const controversy = getControversyLevel(company.controversy_level);
                const IconComponent = controversy.icon;
                
                return (
                  <Card key={company.symbol} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full bg-gray-100 ${controversy.color}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{company.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {company.symbol}
                              </Badge>
                              <Badge variant={controversy.variant} className="text-xs">
                                {company.controversy_level}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(company.controversy_score)}`}>
                            {company.controversy_score.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Controversy Score
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">No High Controversy Companies</h3>
                <p className="text-muted-foreground mb-4">
                  No companies found with controversy score ≥ {minScore[0]}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setMinScore([Math.max(0, minScore[0] - 10)])}
                  disabled={minScore[0] <= 0}
                >
                  Lower Threshold
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Controversies;