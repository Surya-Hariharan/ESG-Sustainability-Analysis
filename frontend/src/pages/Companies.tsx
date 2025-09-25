import Sidebar from '@/components/Sidebar';
import { useTopCompanies } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Companies = () => {
  const [limit, setLimit] = useState(10);
  const { data: companies, isLoading, error, refetch } = useTopCompanies(limit);

  const getRiskBadgeVariant = (score: number) => {
    if (score < 20) return 'default'; // Low risk - green
    if (score < 40) return 'secondary'; // Medium risk - yellow
    return 'destructive'; // High risk - red
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return 'Low Risk';
    if (score < 40) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient-primary mb-2">
                Company Explorer
              </h1>
              <p className="text-lg text-foreground-secondary">
                Top companies with lowest ESG risk scores
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={limit === 10 ? 'default' : 'outline'}
                onClick={() => setLimit(10)}
                size="sm"
              >
                Top 10
              </Button>
              <Button
                variant={limit === 25 ? 'default' : 'outline'}
                onClick={() => setLimit(25)}
                size="sm"
              >
                Top 25
              </Button>
              <Button
                variant={limit === 50 ? 'default' : 'outline'}
                onClick={() => setLimit(50)}
                size="sm"
              >
                Top 50
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load companies: {error.message}
                <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-6 w-16" /> : companies?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best ESG Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : companies && companies.length > 0 ? (
                    companies[0].total_esg_risk_score.toFixed(1)
                  ) : (
                    'N/A'
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : companies && companies.length > 0 ? (
                    (companies.reduce((sum, c) => sum + c.total_esg_risk_score, 0) / companies.length).toFixed(1)
                  ) : (
                    'N/A'
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company, index) => (
                <Card key={company.symbol} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge variant={getRiskBadgeVariant(company.total_esg_risk_score)}>
                        {getRiskLabel(company.total_esg_risk_score)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{company.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{company.symbol}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sector</span>
                        <span className="text-sm font-medium">{company.sector}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">ESG Risk Score</span>
                        <span className="text-lg font-bold">{company.total_esg_risk_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Companies Found</h3>
                <p className="text-muted-foreground">
                  No company data is available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Companies;