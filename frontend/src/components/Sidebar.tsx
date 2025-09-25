import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  AlertTriangle, 
  Brain, 
  FileText, 
  Info,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Company Explorer', href: '/companies', icon: Building2 },
    { name: 'Sector Insights', href: '/sectors', icon: BarChart3 },
    { name: 'Controversy Watch', href: '/controversies', icon: AlertTriangle },
    { name: 'ESG Predictor', href: '/predictor', icon: Brain },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen z-40 glass-nav border-r border-glass-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <div className="flex flex-col h-full p-3">
        {/* Logo & Toggle */}
        <div className="flex items-center mb-8 relative">
          <Link to="/" className={cn(
            "flex items-center hover-lift transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "space-x-3 flex-1"
          )}>
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h1 className="text-lg font-bold text-gradient-primary truncate">
                  ESG Analytics
                </h1>
                <p className="text-xs text-foreground-secondary truncate">
                  Risk Intelligence
                </p>
              </div>
            )}
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hover:bg-glass-bg/50 hover-lift transition-all duration-300 flex-shrink-0",
              isCollapsed ? "w-8 h-8 absolute -right-4 top-1/2 -translate-y-1/2 bg-glass-bg border border-glass-border rounded-full shadow-md" : "w-8 h-8"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-300 hover-lift group relative",
                  active
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-glow"
                    : "text-foreground-secondary hover:text-foreground hover:bg-glass-bg/50",
                  isCollapsed ? "justify-center p-2 mx-1" : "space-x-3 px-3 py-2"
                )}
              >
                {/* Active indicator */}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-primary rounded-r-full" />
                )}
                
                <Icon className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  active ? "w-5 h-5" : "w-4 h-4",
                  "group-hover:scale-110"
                )} />
                
                {!isCollapsed && (
                  <span className="font-medium animate-fade-in text-sm truncate">
                    {item.name}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 glass-card text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-glass-bg border-l border-t border-glass-border rotate-45" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="mt-auto">
          <div className={cn(
            "flex items-center p-2 rounded-lg bg-success/10 border border-success/20 transition-all duration-300",
            isCollapsed ? "justify-center" : "space-x-2"
          )}>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-medium text-success animate-fade-in truncate">
                Live Connected
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;