import { memo, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Filter, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Input,
  Badge,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Progress,
  Button,
} from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useApi, usePagination, useDebounce } from '@/hooks';
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

// Types
interface ControversyData {
  name: string;
  symbol: string;
  sector: string;
  controversy_level: number;
  controversy_score: number;
  total_esg_risk_score: number;
  esg_risk_rating: string;
}

// Controversy Level Badge - Isolated component
const ControversyBadge = memo(function ControversyBadge({
  level,
}: {
  level: number;
}) {
  const getConfig = (lvl: number) => {
    if (lvl <= 1) return { label: 'None', color: 'bg-green-500', icon: CheckCircle2 };
    if (lvl <= 2) return { label: 'Low', color: 'bg-yellow-500', icon: AlertCircle };
    if (lvl <= 3) return { label: 'Moderate', color: 'bg-orange-500', icon: AlertTriangle };
    if (lvl <= 4) return { label: 'High', color: 'bg-red-500', icon: XCircle };
    return { label: 'Severe', color: 'bg-red-700', icon: XCircle };
  };

  const config = getConfig(level);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1', `text-white ${config.color}`)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
});

// Controversy Row - Isolated component
const ControversyRow = memo(function ControversyRow({
  company,
}: {
  company: ControversyData;
}) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{company.name}</p>
          <p className="text-xs text-muted-foreground">{company.symbol}</p>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="text-sm">{company.sector}</span>
      </TableCell>
      <TableCell>
        <ControversyBadge level={company.controversy_level} />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <Progress
            value={(company.controversy_score / 5) * 100}
            className="w-20 h-2"
          />
          <span className="text-sm font-medium">{company.controversy_score.toFixed(1)}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={cn(
            company.esg_risk_rating === 'Low' && 'border-green-500 text-green-500',
            company.esg_risk_rating === 'Medium' && 'border-yellow-500 text-yellow-500',
            company.esg_risk_rating === 'High' && 'border-orange-500 text-orange-500',
            company.esg_risk_rating === 'Severe' && 'border-red-500 text-red-500'
          )}
        >
          {company.total_esg_risk_score.toFixed(1)}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

// Loading Skeleton
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
});

// Main Controversies Page
function Controversies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch controversies data
  const { data: controversies, isLoading } = useApi<ControversyData[]>(
    'controversies',
    () => apiService.getControversies(),
    { cacheTime: 5 * 60 * 1000 }
  );

  // Filter data
  const filteredData = useMemo(() => {
    if (!controversies) return [];
    return controversies.filter((c) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        if (
          !c.name.toLowerCase().includes(query) &&
          !c.symbol.toLowerCase().includes(query) &&
          !c.sector.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (levelFilter !== 'all') {
        const level = parseInt(levelFilter);
        if (c.controversy_level !== level) return false;
      }
      return true;
    });
  }, [controversies, debouncedSearch, levelFilter]);

  // Pagination
  const pagination = usePagination({
    totalItems: filteredData.length,
    initialPageSize: 15,
  });

  const paginatedData = useMemo(() => {
    const start = pagination.startIndex;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.startIndex, pagination.pageSize]);

  // Chart data
  const levelDistribution = useMemo(() => {
    if (!controversies) return [];
    const counts = { None: 0, Low: 0, Moderate: 0, High: 0, Severe: 0 };
    controversies.forEach((c) => {
      if (c.controversy_level <= 1) counts.None++;
      else if (c.controversy_level <= 2) counts.Low++;
      else if (c.controversy_level <= 3) counts.Moderate++;
      else if (c.controversy_level <= 4) counts.High++;
      else counts.Severe++;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color:
        name === 'None'
          ? '#10b981'
          : name === 'Low'
          ? '#eab308'
          : name === 'Moderate'
          ? '#f97316'
          : name === 'High'
          ? '#ef4444'
          : '#7f1d1d',
    }));
  }, [controversies]);

  const sectorControversies = useMemo(() => {
    if (!controversies) return [];
    const sectorAvg: Record<string, { sum: number; count: number }> = {};
    controversies.forEach((c) => {
      if (!sectorAvg[c.sector]) sectorAvg[c.sector] = { sum: 0, count: 0 };
      sectorAvg[c.sector].sum += c.controversy_level;
      sectorAvg[c.sector].count++;
    });
    return Object.entries(sectorAvg)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.slice(0, 12) + '...' : name,
        value: data.sum / data.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [controversies]);

  // Stats
  const stats = useMemo(() => {
    if (!controversies || controversies.length === 0) {
      return { total: 0, highRisk: 0, avgLevel: 0 };
    }
    const highRisk = controversies.filter((c) => c.controversy_level >= 4).length;
    const avgLevel =
      controversies.reduce((sum, c) => sum + c.controversy_level, 0) /
      controversies.length;
    return { total: controversies.length, highRisk, avgLevel };
  }, [controversies]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Controversies</h1>
        <p className="text-muted-foreground">
          Track and analyze ESG-related controversies and incidents across companies.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High/Severe Risk</p>
                  <p className="text-2xl font-bold text-red-500">{stats.highRisk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Controversy Level</p>
                  <p className="text-2xl font-bold">{stats.avgLevel.toFixed(2)}</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChart
            data={levelDistribution}
            title="Controversy Level Distribution"
            description="Companies grouped by controversy severity"
            height={300}
            innerRadius={50}
            outerRadius={100}
          />
          <BarChart
            data={sectorControversies}
            dataKey="value"
            xAxisKey="name"
            title="Average Controversy by Sector"
            description="Top 8 sectors with highest controversy levels"
            colorByValue
            height={300}
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">None (0)</SelectItem>
                  <SelectItem value="1">Low (1)</SelectItem>
                  <SelectItem value="2">Low-Moderate (2)</SelectItem>
                  <SelectItem value="3">Moderate (3)</SelectItem>
                  <SelectItem value="4">High (4)</SelectItem>
                  <SelectItem value="5">Severe (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} companies
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.previousPage}
            disabled={!pagination.hasPreviousPage}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.nextPage}
            disabled={!pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Sector</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="hidden sm:table-cell">Score</TableHead>
                    <TableHead className="text-center">ESG Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((company, index) => (
                    <ControversyRow
                      key={`${company.symbol}-${index}`}
                      company={company}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default memo(Controversies);
