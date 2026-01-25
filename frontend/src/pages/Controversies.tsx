import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Calendar, Building2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import BlurText from '@/components/BlurText';

const Controversies = () => {
  const controversies = [
    {
      id: 1,
      company: 'ExxonMobil',
      title: 'Environmental Impact Assessment',
      description: 'Alleged failure to disclose climate risks to investors',
      severity: 'High',
      category: 'Environmental',
      date: '2025-12-15',
      status: 'Ongoing',
    },
    {
      id: 2,
      company: 'Amazon',
      title: 'Labor Rights Concerns',
      description: 'Reports of unsafe working conditions in warehouses',
      severity: 'Medium',
      category: 'Social',
      date: '2025-11-22',
      status: 'Under Review',
    },
    {
      id: 3,
      company: 'Facebook',
      title: 'Data Privacy Breach',
      description: 'Unauthorized sharing of user data with third parties',
      severity: 'High',
      category: 'Governance',
      date: '2025-10-08',
      status: 'Resolved',
    },
    {
      id: 4,
      company: 'BP',
      title: 'Oil Spill Incident',
      description: 'Major offshore drilling accident causing environmental damage',
      severity: 'Severe',
      category: 'Environmental',
      date: '2025-09-30',
      status: 'Ongoing',
    },
    {
      id: 5,
      company: 'Nike',
      title: 'Supply Chain Ethics',
      description: 'Allegations of child labor in manufacturing facilities',
      severity: 'High',
      category: 'Social',
      date: '2025-08-14',
      status: 'Under Review',
    },
    {
      id: 6,
      company: 'Wells Fargo',
      title: 'Corporate Governance Issues',
      description: 'Questionable executive compensation practices',
      severity: 'Medium',
      category: 'Governance',
      date: '2025-07-05',
      status: 'Resolved',
    },
  ];

  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string }> = {
      Severe: {
        icon: AlertTriangle,
        color: 'text-[#FF4757]',
        bg: 'bg-[#FF4757]/20 border-[#FF4757]/30',
      },
      High: {
        icon: AlertCircle,
        color: 'text-[#FF6B6B]',
        bg: 'bg-[#FF6B6B]/20 border-[#FF6B6B]/30',
      },
      Medium: {
        icon: AlertCircle,
        color: 'text-[#FFD700]',
        bg: 'bg-[#FFD700]/20 border-[#FFD700]/30',
      },
      Low: {
        icon: Info,
        color: 'text-[#9EFFCD]',
        bg: 'bg-[#9EFFCD]/20 border-[#9EFFCD]/30',
      },
    };
    return configs[severity] || configs.Low;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Environmental: 'from-[#9EFFCD] to-[#6BFFEA]',
      Social: 'from-[#9429FF] to-[#B76EFF]',
      Governance: 'from-[#6B9EFF] to-[#9EFFCD]',
    };
    return colors[category] || colors.Environmental;
  };

  const stats = [
    { label: 'Active Cases', value: '127', color: 'from-[#FF6B6B] to-[#FF4757]' },
    { label: 'Under Review', value: '43', color: 'from-[#FFD700] to-[#FFA500]' },
    { label: 'Resolved', value: '89', color: 'from-[#9EFFCD] to-[#6BFFEA]' },
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
            text="ESG Controversies & Alerts"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9429FF] via-purple-500 to-[#9EFFCD] bg-clip-text text-transparent"
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track and monitor sustainability controversies, ethical violations, and corporate misconduct
          </p>
        </motion.div>

        {/* Stats Cards */}
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
                  <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
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
                  All Categories
                </Button>
                <Button variant="outline" size="sm">Environmental</Button>
                <Button variant="outline" size="sm">Social</Button>
                <Button variant="outline" size="sm">Governance</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controversies List */}
        <div className="space-y-4">
          {controversies.map((controversy, index) => {
            const severityConfig = getSeverityConfig(controversy.severity);
            const SeverityIcon = severityConfig.icon;

            return (
              <motion.div
                key={controversy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-background/60 border-white/10 hover:bg-background/80 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(controversy.category)}`}>
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{controversy.title}</CardTitle>
                            <p className="text-sm font-medium text-muted-foreground">{controversy.company}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {controversy.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className={severityConfig.bg}>
                            <SeverityIcon className={`h-3 w-3 mr-1 ${severityConfig.color}`} />
                            {controversy.severity}
                          </Badge>
                          <Badge variant="outline" className="border-white/10">
                            {controversy.category}
                          </Badge>
                          <Badge variant="outline" className="border-white/10">
                            {controversy.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {controversy.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Controversies;
