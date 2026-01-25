import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Target,
  Users,
  BarChart3,
  Shield,
  Lightbulb,
  Github,
  ExternalLink,
  Mail,
  Database,
  Brain,
  Code,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
} from '@/components/ui';

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

// Feature Card
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  description,
  color,
}: FeatureProps) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
});

// Team Member Card
interface TeamMemberProps {
  name: string;
  role: string;
  avatar: string;
}

const TeamMember = memo(function TeamMember({
  name,
  role,
  avatar,
}: TeamMemberProps) {
  return (
    <div className="text-center">
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-500 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
        {avatar}
      </div>
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  );
});

// Tech Stack Item
const TechItem = memo(function TechItem({
  name,
  icon,
}: {
  name: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
      {icon}
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
});

// Main About Page
function About() {
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Comprehensive Analytics',
      description:
        'Advanced ESG analytics covering environmental, social, and governance metrics across thousands of companies.',
      color: '#3b82f6',
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Predictions',
      description:
        'Machine learning models trained on extensive ESG data to predict risk levels and identify trends.',
      color: '#8b5cf6',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Risk Assessment',
      description:
        'Evaluate company and portfolio ESG risks with detailed breakdowns and controversy tracking.',
      color: '#f97316',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Sector Comparison',
      description:
        'Compare ESG performance across different industry sectors to identify leaders and laggards.',
      color: '#10b981',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Data-Driven Insights',
      description:
        'Access cleaned and processed ESG data with regular updates and comprehensive coverage.',
      color: '#06b6d4',
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: 'Actionable Recommendations',
      description:
        'Receive tailored recommendations based on ESG analysis to improve sustainability strategies.',
      color: '#eab308',
    },
  ];

  const techStack = [
    { name: 'React', icon: <Code className="h-4 w-4" /> },
    { name: 'TypeScript', icon: <Code className="h-4 w-4" /> },
    { name: 'FastAPI', icon: <Code className="h-4 w-4" /> },
    { name: 'PostgreSQL', icon: <Database className="h-4 w-4" /> },
    { name: 'PyTorch', icon: <Brain className="h-4 w-4" /> },
    { name: 'Tailwind CSS', icon: <Code className="h-4 w-4" /> },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <Leaf className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">About ESG Analytics</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Empowering sustainable investment decisions through comprehensive ESG
          data analysis and AI-powered insights.
        </p>
      </motion.section>

      {/* Mission Statement */}
      <motion.section variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
          <CardContent className="py-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                We believe that transparency in environmental, social, and governance
                practices is essential for building a sustainable future. Our platform
                democratizes access to ESG data, enabling investors, researchers, and
                organizations to make informed decisions that align financial returns
                with positive impact.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Features */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>
              Built with modern, scalable technologies for reliable performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech) => (
                <TechItem key={tech.name} {...tech} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Data Sources */}
      <motion.section variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Data & Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our ESG data is sourced from publicly available datasets and processed
              using rigorous data cleaning and normalization techniques. Our scoring
              methodology considers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Environmental</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Carbon emissions</li>
                  <li>• Resource usage</li>
                  <li>• Waste management</li>
                  <li>• Climate policies</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Social</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Labor practices</li>
                  <li>• Human rights</li>
                  <li>• Community impact</li>
                  <li>• Product safety</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">Governance</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Board structure</li>
                  <li>• Executive compensation</li>
                  <li>• Shareholder rights</li>
                  <li>• Business ethics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Contact */}
      <motion.section variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have questions or feedback? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:contact@esg-analytics.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </a>
              </Button>
              <Button asChild>
                <Link to="/predictor">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try the Predictor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
}

export default memo(About);
