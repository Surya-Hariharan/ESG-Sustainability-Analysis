import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Info } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Skeleton,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { BarChart, PieChart, RadarChart } from '@/components/charts';
import { useApi } from '@/hooks';
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

// Types
interface SectorData {
  sector: string;
  avg_score: number;
  env_avg: number;
  social_avg: number;
  gov_avg: number;
  company_count: number;
}

// Sector Card - Isolated component
const SectorCard = memo(function SectorCard({ sector }: { sector: SectorData }) {
  const getScoreColor = (score: number) => {
    if (score <= 15) return 'text-green-500';
    if (score <= 25) return 'text-yellow-500';
    if (score <= 35) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{sector.sector}</CardTitle>
        <CardDescription>{sector.company_count} companies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Avg ESG Score</span>
          <span className={cn('text-2xl font-bold', getScoreColor(sector.avg_score))}>
            {sector.avg_score.toFixed(1)}
          </span>
        </div>

        {/* Score bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-20 text-muted-foreground">Environment</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(sector.env_avg * 2, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8">{sector.env_avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-20 text-muted-foreground">Social</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(sector.social_avg * 2, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8">{sector.social_avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-20 text-muted-foreground">Governance</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(sector.gov_avg * 2, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8">{sector.gov_avg.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Loading skeleton
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// Main Sectors Page
function Sectors() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch sector data
  const { data: sectorData, isLoading } = useApi<SectorData[]>(
    'sector-analysis',
    () => apiService.getSectorAverages(),
    { cacheTime: 10 * 60 * 1000 }
  );

  // Prepare chart data
  const barChartData = useMemo(() => {
    if (!sectorData) return [];
    return sectorData
      .sort((a, b) => a.avg_score - b.avg_score)
      .slice(0, 10)
      .map((s) => ({
        name: s.sector.length > 20 ? s.sector.slice(0, 17) + '...' : s.sector,
        value: s.avg_score,
        fullName: s.sector,
      }));
  }, [sectorData]);

  const pieChartData = useMemo(() => {
    if (!sectorData) return [];
    return sectorData
      .sort((a, b) => b.company_count - a.company_count)
      .slice(0, 8)
      .map((s) => ({
        name: s.sector.length > 15 ? s.sector.slice(0, 12) + '...' : s.sector,
        value: s.company_count,
      }));
  }, [sectorData]);

  const radarData = useMemo(() => {
    if (!sectorData) return [];
    const topSectors = sectorData.slice(0, 5);
    return [
      {
        metric: 'Environment',
        ...Object.fromEntries(topSectors.map((s) => [s.sector, s.env_avg])),
      },
      {
        metric: 'Social',
        ...Object.fromEntries(topSectors.map((s) => [s.sector, s.social_avg])),
      },
      {
        metric: 'Governance',
        ...Object.fromEntries(topSectors.map((s) => [s.sector, s.gov_avg])),
      },
    ];
  }, [sectorData]);

  // Summary stats
  const stats = useMemo(() => {
    if (!sectorData || sectorData.length === 0)
      return { totalSectors: 0, avgScore: 0, bestSector: '', worstSector: '' };

    const sorted = [...sectorData].sort((a, b) => a.avg_score - b.avg_score);
    return {
      totalSectors: sectorData.length,
      avgScore:
        sectorData.reduce((sum, s) => sum + s.avg_score, 0) / sectorData.length,
      bestSector: sorted[0]?.sector || 'N/A',
      worstSector: sorted[sorted.length - 1]?.sector || 'N/A',
    };
  }, [sectorData]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Sector Analysis</h1>
        <p className="text-muted-foreground">
          Compare ESG performance across different industry sectors.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sectors</p>
                  <p className="text-2xl font-bold">{stats.totalSectors}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg ESG Score</p>
                  <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Best Performing</p>
                <p className="font-bold text-green-500 line-clamp-1">{stats.bestSector}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Needs Improvement</p>
                <p className="font-bold text-orange-500 line-clamp-1">{stats.worstSector}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectorData?.map((sector) => (
                  <SectorCard key={sector.sector} sector={sector} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                data={barChartData}
                dataKey="value"
                xAxisKey="name"
                title="ESG Score by Sector (Top 10 Best)"
                description="Lower scores indicate better ESG performance"
                colorByValue
                height={400}
              />
              <PieChart
                data={pieChartData}
                title="Companies by Sector"
                description="Distribution of companies across sectors"
                height={400}
                innerRadius={60}
                outerRadius={120}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Details</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of ESG metrics by sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Sector</th>
                        <th className="text-center p-3">Companies</th>
                        <th className="text-center p-3">Avg Score</th>
                        <th className="text-center p-3">Environment</th>
                        <th className="text-center p-3">Social</th>
                        <th className="text-center p-3">Governance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorData?.map((sector) => (
                        <tr key={sector.sector} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{sector.sector}</td>
                          <td className="text-center p-3">{sector.company_count}</td>
                          <td className="text-center p-3">
                            <Badge variant="outline">{sector.avg_score.toFixed(1)}</Badge>
                          </td>
                          <td className="text-center p-3 text-green-600">
                            {sector.env_avg.toFixed(1)}
                          </td>
                          <td className="text-center p-3 text-blue-600">
                            {sector.social_avg.toFixed(1)}
                          </td>
                          <td className="text-center p-3 text-purple-600">
                            {sector.gov_avg.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default memo(Sectors);
