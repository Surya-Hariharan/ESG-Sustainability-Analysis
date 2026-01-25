import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Button,
  Badge,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import { useApi } from '@/hooks';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';

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

// Report types
interface Report {
  id: string;
  title: string;
  description: string;
  type: 'sector' | 'company' | 'trend' | 'controversy';
  date: string;
  status: 'ready' | 'generating' | 'pending';
}

// Sample reports data
const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Q4 2024 ESG Sector Analysis',
    description: 'Comprehensive analysis of ESG performance across all sectors',
    type: 'sector',
    date: '2024-01-15',
    status: 'ready',
  },
  {
    id: '2',
    title: 'Top 100 Companies ESG Ranking',
    description: 'Ranking of top performing companies by ESG metrics',
    type: 'company',
    date: '2024-01-10',
    status: 'ready',
  },
  {
    id: '3',
    title: 'ESG Risk Trends 2023-2024',
    description: 'Year-over-year analysis of ESG risk trends',
    type: 'trend',
    date: '2024-01-08',
    status: 'ready',
  },
  {
    id: '4',
    title: 'Controversy Impact Report',
    description: 'Analysis of ESG controversies and their market impact',
    type: 'controversy',
    date: '2024-01-05',
    status: 'ready',
  },
  {
    id: '5',
    title: 'January 2024 Monthly Report',
    description: 'Monthly summary of ESG developments and metrics',
    type: 'trend',
    date: '2024-01-20',
    status: 'generating',
  },
];

// Report Card - Isolated component
const ReportCard = memo(function ReportCard({ report }: { report: Report }) {
  const getTypeIcon = () => {
    switch (report.type) {
      case 'sector':
        return <BarChart3 className="h-5 w-5" />;
      case 'company':
        return <FileText className="h-5 w-5" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'controversy':
        return <Filter className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadgeColor = () => {
    switch (report.type) {
      case 'sector':
        return 'bg-blue-500';
      case 'company':
        return 'bg-green-500';
      case 'trend':
        return 'bg-purple-500';
      case 'controversy':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-xs', getTypeBadgeColor())}>
                  {report.type}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(report.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {report.status === 'ready' ? (
            <Badge variant="outline" className="text-green-500 border-green-500">
              Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              {report.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{report.description}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
});

// Analytics Summary Card
const AnalyticsSummary = memo(function AnalyticsSummary({
  isLoading,
}: {
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total Reports</p>
          <p className="text-2xl font-bold">{sampleReports.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Ready to Download</p>
          <p className="text-2xl font-bold text-green-500">
            {sampleReports.filter((r) => r.status === 'ready').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-yellow-500">
            {sampleReports.filter((r) => r.status !== 'ready').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="text-lg font-bold">Today</p>
        </CardContent>
      </Card>
    </div>
  );
});

// Main Reports Page
function Reports() {
  const [activeTab, setActiveTab] = useState('reports');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch sector data for analytics
  const { data: sectorData, isLoading } = useApi(
    'reports-sector-data',
    () => apiService.getSectorAverages(),
    { cacheTime: 10 * 60 * 1000 }
  );

  // Filter reports
  const filteredReports = useMemo(() => {
    if (typeFilter === 'all') return sampleReports;
    return sampleReports.filter((r) => r.type === typeFilter);
  }, [typeFilter]);

  // Chart data
  const trendData = useMemo(
    () => [
      { month: 'Jul', environment: 22, social: 18, governance: 15 },
      { month: 'Aug', environment: 20, social: 19, governance: 14 },
      { month: 'Sep', environment: 19, social: 17, governance: 13 },
      { month: 'Oct', environment: 18, social: 16, governance: 12 },
      { month: 'Nov', environment: 17, social: 15, governance: 11 },
      { month: 'Dec', environment: 16, social: 14, governance: 10 },
    ],
    []
  );

  const riskDistribution = useMemo(
    () => [
      { name: 'Low Risk', value: 35, color: '#10b981' },
      { name: 'Medium Risk', value: 40, color: '#eab308' },
      { name: 'High Risk', value: 18, color: '#f97316' },
      { name: 'Severe Risk', value: 7, color: '#ef4444' },
    ],
    []
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Access comprehensive ESG reports and analytics dashboards.
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div variants={itemVariants}>
        <AnalyticsSummary isLoading={isLoading} />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6 space-y-4">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Available Reports</h2>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sector">Sector</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="trend">Trend</SelectItem>
                  <SelectItem value="controversy">Controversy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={trendData}
                lines={[
                  { key: 'environment', name: 'Environment', color: '#10b981' },
                  { key: 'social', name: 'Social', color: '#3b82f6' },
                  { key: 'governance', name: 'Governance', color: '#8b5cf6' },
                ]}
                xAxisKey="month"
                title="ESG Score Trends (6 Months)"
                description="Monthly average risk scores by category"
                height={300}
              />
              <PieChart
                data={riskDistribution}
                title="Portfolio Risk Distribution"
                description="Current distribution of risk levels"
                height={300}
                innerRadius={60}
                outerRadius={100}
              />
            </div>

            {/* Additional Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Improving</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Overall ESG scores improved by 12% compared to last quarter.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Top Performer</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Technology sector leads with lowest average risk score.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Watch List</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      25 companies flagged for increased controversy levels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default memo(Reports);
