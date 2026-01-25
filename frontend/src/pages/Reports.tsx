import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, TrendingUp, BarChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const Reports = () => {
  const reports = [
    {
      id: 1,
      title: 'Q4 2025 ESG Sustainability Report',
      type: 'Quarterly',
      date: '2025-12-31',
      size: '2.4 MB',
      icon: FileText,
      color: 'from-[#9429FF] to-[#B76EFF]',
      pages: 45,
    },
    {
      id: 2,
      title: 'Technology Sector Analysis 2025',
      type: 'Sector Report',
      date: '2025-12-15',
      size: '1.8 MB',
      icon: BarChart,
      color: 'from-[#6B9EFF] to-[#9EFFCD]',
      pages: 32,
    },
    {
      id: 3,
      title: 'Global ESG Trends & Insights',
      type: 'Annual',
      date: '2025-12-01',
      size: '4.2 MB',
      icon: TrendingUp,
      color: 'from-[#9EFFCD] to-[#6BFFEA]',
      pages: 78,
    },
    {
      id: 4,
      title: 'Risk Assessment Summary',
      type: 'Monthly',
      date: '2025-11-30',
      size: '1.2 MB',
      icon: PieChart,
      color: 'from-[#9429FF] to-[#9EFFCD]',
      pages: 24,
    },
    {
      id: 5,
      title: 'Corporate Governance Review',
      type: 'Quarterly',
      date: '2025-11-15',
      size: '3.1 MB',
      icon: FileText,
      color: 'from-[#7AFFCD] to-[#6BFFEA]',
      pages: 56,
    },
    {
      id: 6,
      title: 'Environmental Impact Study',
      type: 'Special',
      date: '2025-11-01',
      size: '2.8 MB',
      icon: BarChart,
      color: 'from-[#9429FF] to-[#B76EFF]',
      pages: 41,
    },
  ];

  const stats = [
    { label: 'Total Reports', value: '248', icon: FileText },
    { label: 'This Year', value: '52', icon: Calendar },
    { label: 'Downloads', value: '12.4K', icon: Download },
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
            text="ESG Reports & Analytics"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download comprehensive ESG reports, sector analyses, and sustainability insights
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-[#9EFFCD]" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  All Types
                </Button>
                <Button variant="outline" size="sm">Quarterly</Button>
                <Button variant="outline" size="sm">Annual</Button>
                <Button variant="outline" size="sm">Monthly</Button>
                <Button variant="outline" size="sm">Sector</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group h-full">
                <CardHeader>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${report.color}`}>
                      <report.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight mb-2">
                        {report.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs border-white/10">
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium">{report.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pages</p>
                      <p className="font-medium">{report.pages}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Size: {report.size}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Reports;
