import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Users,
  Scale,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useApi } from '@/hooks';
import { apiService } from '@/services/api';
import { formatNumber, getRiskColor } from '@/lib/utils';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// Stat Card Component - Isolated and memoized
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span
                className={
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

// Feature Card Component - For navigation
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const FeatureCard = memo(function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
}: FeatureCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
        <CardHeader>
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Explore <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
});

// Top Companies List - Isolated component
interface Company {
  name: string;
  sector: string;
  esg_risk_rating: string;
  total_esg_risk_score: number;
}

const TopCompaniesList = memo(function TopCompaniesList({
  companies,
  isLoading,
}: {
  companies: Company[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Top Performing Companies</CardTitle>
        <Link to="/companies">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {companies.slice(0, 5).map((company, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{company.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {company.sector}
              </p>
            </div>
            <Badge
              variant={
                company.esg_risk_rating === 'Low'
                  ? 'success'
                  : company.esg_risk_rating === 'Medium'
                  ? 'warning'
                  : 'destructive'
              }
            >
              {company.total_esg_risk_score.toFixed(1)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

// Main Dashboard Page
function Index() {
  // Fetch top companies
  const { data: topCompanies, isLoading: companiesLoading } = useApi<Company[]>(
    'top-companies',
    () => apiService.getTopCompanies(10),
    { cacheTime: 5 * 60 * 1000 }
  );

  // Fetch sector averages
  const { data: sectorData, isLoading: sectorsLoading } = useApi(
    'sector-averages',
    () => apiService.getSectorAverages(),
    { cacheTime: 5 * 60 * 1000 }
  );

  // Prepare chart data
  const sectorChartData = useMemo(() => {
    if (!sectorData) return [];
    return sectorData.slice(0, 8).map((sector: { sector: string; avg_score: number }) => ({
      name: sector.sector.length > 15 ? sector.sector.slice(0, 15) + '...' : sector.sector,
      value: sector.avg_score,
    }));
  }, [sectorData]);

  const riskDistributionData = useMemo(() => {
    if (!topCompanies) return [];
    const distribution = { Low: 0, Medium: 0, High: 0, Severe: 0 };
    topCompanies.forEach((company) => {
      const rating = company.esg_risk_rating as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      color: getRiskColor(name),
    }));
  }, [topCompanies]);

  const features = [
    {
      title: 'Companies',
      description: 'Explore ESG ratings and performance metrics for thousands of companies.',
      icon: <Building2 className="h-6 w-6" />,
      href: '/companies',
      color: '#3b82f6',
    },
    {
      title: 'Sector Analysis',
      description: 'Compare ESG performance across different industry sectors.',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/sectors',
      color: '#10b981',
    },
    {
      title: 'Controversies',
      description: 'Track and analyze ESG-related controversies and incidents.',
      icon: <AlertTriangle className="h-6 w-6" />,
      href: '/controversies',
      color: '#f59e0b',
    },
    {
      title: 'Risk Predictor',
      description: 'Use AI to predict ESG risk levels based on company metrics.',
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/predictor',
      color: '#8b5cf6',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          ESG Sustainability Analytics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive environmental, social, and governance data analysis platform
          for informed investment decisions.
        </p>
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Companies"
            value={formatNumber(topCompanies?.length || 0)}
            description="Companies analyzed"
            icon={<Building2 className="h-4 w-4" />}
            isLoading={companiesLoading}
          />
          <StatCard
            title="Environment Score"
            value="67.4"
            description="Average across sectors"
            icon={<Leaf className="h-4 w-4" />}
            trend={{ value: 3.2, isPositive: true }}
            isLoading={sectorsLoading}
          />
          <StatCard
            title="Social Score"
            value="58.2"
            description="Average across sectors"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 1.5, isPositive: true }}
            isLoading={sectorsLoading}
          />
          <StatCard
            title="Governance Score"
            value="72.1"
            description="Average across sectors"
            icon={<Scale className="h-4 w-4" />}
            trend={{ value: 0.8, isPositive: false }}
            isLoading={sectorsLoading}
          />
        </div>
      </motion.section>

      {/* Charts Section */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={sectorChartData}
            dataKey="value"
            xAxisKey="name"
            title="Average ESG Score by Sector"
            description="Top 8 sectors by average score"
            colorByValue
            height={300}
          />
          <PieChart
            data={riskDistributionData}
            title="Risk Level Distribution"
            description="Distribution of companies by risk rating"
            height={300}
            innerRadius={50}
            outerRadius={100}
          />
        </div>
      </motion.section>

      {/* Feature Cards */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6">Explore Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </motion.section>

      {/* Top Companies */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCompaniesList
            companies={topCompanies || []}
            isLoading={companiesLoading}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/predictor" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Predict ESG Risk
                </Button>
              </Link>
              <Link to="/companies" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Search Companies
                </Button>
              </Link>
              <Link to="/reports" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
              <Link to="/controversies" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Check Controversies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default memo(Index);
