import { memo, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, ChevronDown, ExternalLink } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { RadarChart } from '@/components/charts';
import { useApi, useDebounce, usePagination } from '@/hooks';
import { apiService } from '@/services/api';
import { cn, getRiskColor } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Types
interface Company {
  name: string;
  symbol: string;
  sector: string;
  industry: string;
  country: string;
  total_esg_risk_score: number;
  environment_risk_score: number;
  social_risk_score: number;
  governance_risk_score: number;
  esg_risk_rating: string;
  controversy_level: number;
}

// Company Row - Isolated component
const CompanyRow = memo(function CompanyRow({
  company,
  onSelect,
}: {
  company: Company;
  onSelect: (company: Company) => void;
}) {
  const riskColor = getRiskColor(company.esg_risk_rating);

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSelect(company)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{company.name}</p>
            <p className="text-xs text-muted-foreground">{company.symbol}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="text-sm">{company.sector}</span>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-muted-foreground">{company.country}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-center">
          <span className="font-semibold">{company.total_esg_risk_score.toFixed(1)}</span>
          <Badge
            variant="outline"
            className="text-xs mt-1"
            style={{ borderColor: riskColor, color: riskColor }}
          >
            {company.esg_risk_rating}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex gap-1 justify-center">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${Math.min(company.environment_risk_score, 40)}px`,
              backgroundColor: '#10b981',
            }}
          />
          <div
            className="h-2 rounded-full"
            style={{
              width: `${Math.min(company.social_risk_score, 40)}px`,
              backgroundColor: '#3b82f6',
            }}
          />
          <div
            className="h-2 rounded-full"
            style={{
              width: `${Math.min(company.governance_risk_score, 40)}px`,
              backgroundColor: '#8b5cf6',
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

// Company Detail Modal - Isolated component
const CompanyDetailModal = memo(function CompanyDetailModal({
  company,
  isOpen,
  onClose,
}: {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!company) return null;

  const radarData = [
    { metric: 'Environment', value: company.environment_risk_score },
    { metric: 'Social', value: company.social_risk_score },
    { metric: 'Governance', value: company.governance_risk_score },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company.name}
          </DialogTitle>
          <DialogDescription>{company.sector} • {company.industry}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Company Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{company.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{company.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">ESG Scores</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Environment
                  </span>
                  <span className="font-semibold">{company.environment_risk_score.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Social
                  </span>
                  <span className="font-semibold">{company.social_risk_score.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Governance
                  </span>
                  <span className="font-semibold">{company.governance_risk_score.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">Overall ESG Risk</span>
              <Badge
                variant="outline"
                className="text-lg font-bold px-3"
                style={{
                  borderColor: getRiskColor(company.esg_risk_rating),
                  color: getRiskColor(company.esg_risk_rating),
                }}
              >
                {company.total_esg_risk_score.toFixed(1)}
              </Badge>
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <RadarChart
              data={radarData}
              radars={[{ key: 'value', name: 'Score', color: '#0ea5e9' }]}
              angleKey="metric"
              height={250}
              showLegend={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Loading Skeleton
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
});

// Main Companies Page
function Companies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch companies
  const { data: companies, isLoading } = useApi<Company[]>(
    `companies-${debouncedSearch}-${selectedSector}-${selectedRating}`,
    () => apiService.searchCompanies(debouncedSearch || undefined),
    { cacheTime: 5 * 60 * 1000 }
  );

  // Get unique sectors
  const sectors = useMemo(() => {
    if (!companies) return [];
    const uniqueSectors = [...new Set(companies.map((c) => c.sector))];
    return uniqueSectors.sort();
  }, [companies]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((company) => {
      if (selectedSector !== 'all' && company.sector !== selectedSector) return false;
      if (selectedRating !== 'all' && company.esg_risk_rating !== selectedRating) return false;
      return true;
    });
  }, [companies, selectedSector, selectedRating]);

  // Pagination
  const pagination = usePagination({
    totalItems: filteredCompanies.length,
    initialPageSize: 10,
  });

  const paginatedCompanies = useMemo(() => {
    const start = pagination.startIndex;
    const end = start + pagination.pageSize;
    return filteredCompanies.slice(start, end);
  }, [filteredCompanies, pagination.startIndex, pagination.pageSize]);

  const handleSelectCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCompany(null);
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
        <h1 className="text-3xl font-bold mb-2">Companies</h1>
        <p className="text-muted-foreground">
          Explore ESG ratings and sustainability metrics for companies worldwide.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Sector Filter */}
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                  <SelectItem value="Severe">Severe Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
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

      {/* Companies Table */}
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
                    <TableHead className="hidden lg:table-cell">Country</TableHead>
                    <TableHead className="text-center">ESG Score</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">
                      E/S/G
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company, index) => (
                    <CompanyRow
                      key={`${company.symbol}-${index}`}
                      company={company}
                      onSelect={handleSelectCompany}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
}

export default memo(Companies);
