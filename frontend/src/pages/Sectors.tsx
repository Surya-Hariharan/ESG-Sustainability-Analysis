import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory, Zap, Heart, Building2, Truck, Cpu, Award,
  Grid3X3, BarChart3, Target, ChevronRight, Sparkles, ArrowUpRight,
  ArrowDownRight, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'comparison' | 'radial';
type SortBy = 'score' | 'companies' | 'trend' | 'name';

const Sectors = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('score');

  const sectors = [
    {
      id: 1,
      name: 'Technology',
      icon: Cpu,
      avgScore: 85,
      companies: 1245,
      trend: 5.2,
      color: 'from-[#9429FF] to-[#B76EFF]',
      performance: {
        environment: 82,
        social: 88,
        governance: 85,
      },
      description: 'Leading in digital transformation and sustainable innovation',
      topCompanies: ['Apple Inc.', 'Microsoft Corp.', 'Google LLC'],
    },
    {
      id: 2,
      name: 'Healthcare',
      icon: Heart,
      avgScore: 78,
      companies: 892,
      trend: 3.8,
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
      performance: {
        environment: 75,
        social: 83,
        governance: 76,
      },
      description: 'Prioritizing patient care and ethical medical practices',
      topCompanies: ['Johnson & Johnson', 'Pfizer Inc.', 'UnitedHealth'],
    },
    {
      id: 3,
      name: 'Manufacturing',
      icon: Factory,
      avgScore: 65,
      companies: 2156,
      trend: 2.1,
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
      performance: {
        environment: 62,
        social: 68,
        governance: 65,
      },
      description: 'Advancing circular economy and sustainable production',
      topCompanies: ['Toyota Motor', 'Siemens AG', '3M Company'],
    },
    {
      id: 4,
      name: 'Energy',
      icon: Zap,
      avgScore: 58,
      companies: 543,
      trend: -1.5,
      color: 'from-[#FFD700] to-[#FFA500]',
      performance: {
        environment: 48,
        social: 65,
        governance: 61,
      },
      description: 'Transitioning to renewable and clean energy sources',
      topCompanies: ['NextEra Energy', 'Enel SpA', 'Ørsted A/S'],
    },
    {
      id: 5,
      name: 'Real Estate',
      icon: Building2,
      avgScore: 72,
      companies: 1087,
      trend: 4.3,
      color: 'from-[#9429FF] to-[#9EFFCD]',
      performance: {
        environment: 70,
        social: 74,
        governance: 72,
      },
      description: 'Building sustainable communities and green infrastructure',
      topCompanies: ['Prologis Inc.', 'Simon Property', 'Vonovia SE'],
    },
    {
      id: 6,
      name: 'Transportation',
      icon: Truck,
      avgScore: 61,
      companies: 678,
      trend: 1.9,
      color: 'from-[#7AFFCD] to-[#6BFFEA]',
      performance: {
        environment: 55,
        social: 64,
        governance: 64,
      },
      description: 'Driving towards zero-emission mobility solutions',
      topCompanies: ['Tesla Inc.', 'Union Pacific', 'FedEx Corp.'],
    },
  ];

  const sortedSectors = [...sectors].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.avgScore - a.avgScore;
      case 'companies':
        return b.companies - a.companies;
      case 'trend':
        return b.trend - a.trend;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#9EFFCD]';
    if (score >= 60) return 'text-[#FFD700]';
    return 'text-[#FF6B6B]';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-[#9EFFCD] to-[#6BFFEA]';
    if (score >= 60) return 'from-[#FFD700] to-[#FFA500]';
    return 'from-[#FF6B6B] to-[#FF4757]';
  };

  const toggleCardFlip = (id: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const topPerformers = [
    { name: 'Apple Inc.', sector: 'Technology', score: 91 },
    { name: 'Microsoft Corp.', sector: 'Technology', score: 89 },
    { name: 'Tesla Inc.', sector: 'Automotive', score: 87 },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <BlurText
            text="Industry Sector Analysis"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore ESG performance across industries with interactive visualizations
          </p>
        </motion.div>

        {/* View Mode Selector & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 p-1 rounded-xl bg-background/60 backdrop-blur-xl border border-white/10">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-[#9429FF] to-[#B76EFF]' : ''}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('comparison')}
              className={viewMode === 'comparison' ? 'bg-gradient-to-r from-[#9429FF] to-[#B76EFF]' : ''}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparison
            </Button>
            <Button
              variant={viewMode === 'radial' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('radial')}
              className={viewMode === 'radial' ? 'bg-gradient-to-r from-[#9429FF] to-[#B76EFF]' : ''}
            >
              <Target className="h-4 w-4 mr-2" />
              Radial
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 rounded-lg bg-background/60 backdrop-blur-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#9429FF]"
            >
              <option value="score">Sort by Score</option>
              <option value="companies">Sort by Companies</option>
              <option value="trend">Sort by Trend</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10 overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Top ESG Performers</CardTitle>
                <Sparkles className="h-4 w-4 text-[#9EFFCD] ml-auto" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {topPerformers.map((company, index) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="relative p-6 rounded-xl bg-gradient-to-br from-background/40 to-background/20 hover:from-background/60 hover:to-background/40 transition-all duration-300 border border-white/5 group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#9429FF]/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getScoreGradient(company.score)} text-white font-bold text-lg shadow-lg`}>
                          {index + 1}
                        </div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreGradient(company.score)} bg-clip-text text-transparent`}>
                          {company.score}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.sector}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Views */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedSectors.map((sector, index) => {
                const isFlipped = flippedCards.has(sector.id);

                return (
                  <motion.div
                    key={sector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="perspective-1000"
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      className="relative w-full h-[400px] cursor-pointer"
                      onClick={() => toggleCardFlip(sector.id)}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of Card */}
                      <div
                        className="absolute inset-0 backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:border-white/30 transition-all duration-300 group h-full overflow-hidden relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${sector.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                          <CardHeader className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${sector.color} shadow-lg`}>
                                <sector.icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-background/40 backdrop-blur-sm">
                                {sector.trend > 0 ? (
                                  <ArrowUpRight className="h-4 w-4 text-[#9EFFCD]" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-[#FF6B6B]" />
                                )}
                                <span className={sector.trend > 0 ? 'text-[#9EFFCD]' : 'text-[#FF6B6B]'}>
                                  {sector.trend > 0 ? '+' : ''}{sector.trend}%
                                </span>
                              </div>
                            </div>
                            <CardTitle className="text-xl mb-2">{sector.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{sector.companies.toLocaleString()} Companies</p>
                          </CardHeader>
                          <CardContent className="space-y-4 relative z-10">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Average ESG Score</span>
                                <span className={`text-4xl font-bold ${getScoreColor(sector.avgScore)}`}>
                                  {sector.avgScore}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {Object.entries(sector.performance).map(([key, value]) => (
                                <div key={key}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground capitalize">{key}</span>
                                    <span className="font-medium">{value}%</span>
                                  </div>
                                  <div className="h-2 bg-background/40 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${value}%` }}
                                      transition={{ duration: 1, delay: index * 0.1 }}
                                      className={`h-full bg-gradient-to-r ${sector.color}`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 flex items-center justify-center text-sm text-muted-foreground">
                              <ChevronRight className="h-4 w-4 mr-1" />
                              Click to see more
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Back of Card */}
                      <div
                        className="absolute inset-0 backface-hidden"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <Card className="backdrop-blur-xl bg-background/80 border-white/20 h-full overflow-hidden relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${sector.color} opacity-20`} />
                          <CardHeader className="relative z-10">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${sector.color} w-fit mb-3`}>
                              <sector.icon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle className="text-xl mb-2">{sector.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 relative z-10">
                            <div>
                              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Description</h4>
                              <p className="text-sm">{sector.description}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Top Companies</h4>
                              <ul className="space-y-2">
                                {sector.topCompanies.map((company, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${sector.color}`} />
                                    {company}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-4 flex items-center justify-center text-sm text-muted-foreground">
                              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                              Click to go back
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {viewMode === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#9EFFCD]" />
                    Sector Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sortedSectors.map((sector, index) => (
                      <motion.div
                        key={sector.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${sector.color} shrink-0`}>
                            <sector.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{sector.name}</h3>
                              <span className={`text-2xl font-bold ${getScoreColor(sector.avgScore)}`}>
                                {sector.avgScore}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {sector.companies.toLocaleString()} companies • {sector.trend > 0 ? '+' : ''}{sector.trend}% trend
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pl-14">
                          {Object.entries(sector.performance).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground capitalize">{key.slice(0, 3)}</span>
                                <span className="font-medium">{value}%</span>
                              </div>
                              <div className="h-2 bg-background/40 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 1, delay: index * 0.05 }}
                                  className={`h-full bg-gradient-to-r ${sector.color}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewMode === 'radial' && (
            <motion.div
              key="radial"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center items-center min-h-[700px] py-12"
            >
              <div className="relative w-full max-w-5xl aspect-square">
                {sortedSectors.map((sector, index) => {
                  const angle = (index / sortedSectors.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 42; // increased from 35 for better spacing
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);

                  return (
                    <motion.div
                      key={sector.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="absolute"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.15, zIndex: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="relative"
                      >
                        <Card className="backdrop-blur-xl bg-background/80 border-white/10 w-44 hover:border-white/30 hover:shadow-2xl transition-all duration-300">
                          <CardContent className="p-4">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${sector.color} w-fit mb-2 mx-auto`}>
                              <sector.icon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-center mb-2 text-sm">{sector.name}</h3>
                            <div className={`text-3xl font-bold text-center mb-2 ${getScoreColor(sector.avgScore)}`}>
                              {sector.avgScore}
                            </div>
                            <div className="space-y-1">
                              {Object.entries(sector.performance).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground capitalize">{key.slice(0, 3)}</span>
                                  <span className="font-medium">{value}%</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Center Circle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#9429FF] to-[#9EFFCD] flex items-center justify-center shadow-2xl">
                    <div className="text-center text-white">
                      <div className="text-4xl font-bold">{sortedSectors.length}</div>
                      <div className="text-sm opacity-90">Sectors</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default Sectors;
