import Sidebar from '@/components/Sidebar';
import { useTopCompanies, useSectorAverages, useHighControversyCompanies, useModelInfo } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Reports = () => {
  const { data: topCompanies, isLoading: companiesLoading } = useTopCompanies(10);
  const { data: sectors, isLoading: sectorsLoading } = useSectorAverages();
  const { data: controversies, isLoading: controversiesLoading } = useHighControversyCompanies(50);
  const { data: modelInfo, isLoading: modelLoading } = useModelInfo();

  const isLoading = companiesLoading || sectorsLoading || controversiesLoading || modelLoading;

  const generateReport = (type: string) => {
    // In a real implementation, this would generate and download a report
    alert(`Generating ${type} report... (Demo)`);
  };

  const getRiskColor = (risk: string) => {
    const lowerRisk = risk?.toLowerCase() || '';
    if (lowerRisk.includes('high')) return 'text-red-600 bg-red-50';
    if (lowerRisk.includes('moderate')) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const calculatePortfolioScore = () => {
    if (!topCompanies || topCompanies.length === 0) return 0;
    const avgScore = topCompanies.reduce((sum, c) => sum + c.total_esg_risk_score, 0) / topCompanies.length;
    return 100 - avgScore; // Convert risk score to performance score
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              ESG Reports & Analytics
            </h1>
            <p className="text-lg text-foreground-secondary">
              Comprehensive ESG performance insights and downloadable reports
            </p>
          </div>

          {/* Report Generation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => generateReport('Portfolio Summary')}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Download className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Portfolio Summary</div>
                    <div className="text-xs opacity-75">Top companies & risk analysis</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => generateReport('Sector Analysis')}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <PieChart className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Sector Analysis</div>
                    <div className="text-xs opacity-75">Industry risk breakdown</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => generateReport('Controversy Watch')}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Controversy Watch</div>
                    <div className="text-xs opacity-75">High-risk companies</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Score</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : `${calculatePortfolioScore().toFixed(1)}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  ESG Performance Index
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies Tracked</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : topCompanies?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Top performers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sectors Analyzed</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : sectors?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Industry coverage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : controversies?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Controversy alerts
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Top ESG Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(topCompanies || []).slice(0, 5).map((company, index) => (
                      <div key={company.symbol} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-6 flex items-center justify-center text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{company.name}</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {company.total_esg_risk_score.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sector Risk Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Sector Risk Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(sectors || []).slice(0, 5).map((sector) => {
                      const riskPercentage = Math.min(sector.avg_esg_score, 100);
                      return (
                        <div key={sector.sector}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{sector.sector}</span>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              {sector.avg_esg_score.toFixed(1)}
                            </Badge>
                          </div>
                          <Progress value={riskPercentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  AI Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modelLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : modelInfo ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model Version</span>
                      <span className="font-medium">v{modelInfo.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Features</span>
                      <span className="font-medium">{modelInfo.features.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model Status</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Runtime</span>
                      <span className="font-mono text-sm">{modelInfo.sklearn_version_runtime}</span>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Model information unavailable</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Top Companies Analysis</div>
                        <div className="text-xs text-muted-foreground">Latest ESG leaders</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Sector Risk Assessment</div>
                        <div className="text-xs text-muted-foreground">Industry risk mapping</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">Controversy Monitoring</div>
                        <div className="text-xs text-muted-foreground">High-risk alerts</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;