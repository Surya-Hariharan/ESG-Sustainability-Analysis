// Type declarations for packages without official types
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
  export type Icon = FC<IconProps>;
  
  export const Menu: Icon;
  export const X: Icon;
  export const Leaf: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const Building2: Icon;
  export const TrendingUp: Icon;
  export const TrendingDown: Icon;
  export const Minus: Icon;
  export const Shield: Icon;
  export const BarChart3: Icon;
  export const Zap: Icon;
  export const ArrowRight: Icon;
  export const Factory: Icon;
  export const Heart: Icon;
  export const Cpu: Icon;
  export const Truck: Icon;
  export const Award: Icon;
  export const AlertTriangle: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const Calendar: Icon;
  export const Brain: Icon;
  export const Sparkles: Icon;
  export const CheckCircle: Icon;
  export const FileText: Icon;
  export const Download: Icon;
  export const PieChart: Icon;
  export const BarChart: Icon;
  export const Target: Icon;
  export const Users: Icon;
  export const Github: Icon;
  export const Linkedin: Icon;
  export const Mail: Icon;
  export const RefreshCcw: Icon;
  export const Home: Icon;
  export const Check: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronRight: Icon;
  export const MoreHorizontal: Icon;
}
