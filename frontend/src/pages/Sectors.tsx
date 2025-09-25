import Sidebar from '@/components/Sidebar';
import { useSectorAverages } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

const Sectors = () => {
  const { data: sectors, isLoading, error, refetch } = useSectorAverages();
  const [sortBy, setSortBy] = useState<'score' | 'count'>('score');

  const sortedSectors = sectors ? [...sectors].sort((a, b) => {
    if (sortBy === 'score') {
      return a.avg_esg_score - b.avg_esg_score; // Lower score is better
    }
    return b.company_count - a.company_count; // Higher count first
  }) : [];

  const getRiskLevel = (score: number) => {
    if (score < 20) return { label: 'Low Risk', variant: 'default' as const, color: 'bg-green-500' };
    if (score < 40) return { label: 'Medium Risk', variant: 'secondary' as const, color: 'bg-yellow-500' };
    return { label: 'High Risk', variant: 'destructive' as const, color: 'bg-red-500' };
  };

  const getScoreProgress = (score: number) => {
    return Math.min((score / 100) * 100, 100);
  };

  const bestSector = sortedSectors[0];
  const worstSector = sortedSectors[sortedSectors.length - 1];
  const totalCompanies = sortedSectors.reduce((sum, sector) => sum + sector.company_count, 0);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient-primary mb-2">
                Sector Insights
              </h1>
              <p className="text-lg text-foreground-secondary">
                ESG risk analysis across different sectors
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'score' ? 'default' : 'outline'}
                onClick={() => setSortBy('score')}
                size="sm"
              >
                Sort by Risk
              </Button>
              <Button
                variant={sortBy === 'count' ? 'default' : 'outline'}
                onClick={() => setSortBy('count')}
                size="sm"
              >
                Sort by Size
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load sector data: {error.message}
                <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sectors</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : sortedSectors.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : totalCompanies.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Sector</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">
                  {isLoading ? <Skeleton className="h-4 w-20" /> : bestSector?.sector || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoading ? <Skeleton className="h-3 w-16" /> : bestSector ? `${bestSector.avg_esg_score.toFixed(1)} risk score` : ''}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Risk</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">
                  {isLoading ? <Skeleton className="h-4 w-20" /> : worstSector?.sector || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoading ? <Skeleton className="h-3 w-16" /> : worstSector ? `${worstSector.avg_esg_score.toFixed(1)} risk score` : ''}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sectors Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedSectors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSectors.map((sector, index) => {
                const risk = getRiskLevel(sector.avg_esg_score);
                const progress = getScoreProgress(sector.avg_esg_score);
                
                return (
                  <Card key={sector.sector} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant={risk.variant}>
                          {risk.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{sector.sector}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {sector.company_count} companies
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Average ESG Risk</span>
                            <span className="text-lg font-bold">{sector.avg_esg_score.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={progress} className="flex-1 h-2" />
                            <div className={`w-2 h-2 rounded-full ${risk.color}`}></div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            Risk Level: <span className="font-medium">{risk.label}</span>
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
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Sector Data Found</h3>
                <p className="text-muted-foreground">
                  Sector analysis data is not available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Sectors;