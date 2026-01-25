import { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  PieChart,
  AlertTriangle,
  Brain,
  FileText,
  Info,
  Menu,
  X,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useIsMobile } from '@/hooks';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Companies', path: '/companies', icon: <Building2 className="h-4 w-4" /> },
  { label: 'Sectors', path: '/sectors', icon: <PieChart className="h-4 w-4" /> },
  { label: 'Controversies', path: '/controversies', icon: <AlertTriangle className="h-4 w-4" /> },
  { label: 'Predictor', path: '/predictor', icon: <Brain className="h-4 w-4" /> },
  { label: 'Reports', path: '/reports', icon: <FileText className="h-4 w-4" /> },
  { label: 'About', path: '/about', icon: <Info className="h-4 w-4" /> },
];

// Desktop Navigation Link - Memoized to prevent unnecessary re-renders
const NavLink = memo(function NavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      to={item.path}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
        'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {item.icon}
      {item.label}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
});

// Mobile Navigation Link - Memoized
const MobileNavLink = memo(function MobileNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground rounded-lg',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
});

// Mobile Menu Overlay
const MobileMenu = memo(function MobileMenu({
  isOpen,
  onClose,
  currentPath,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg">Navigation</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.path}
                  item={item}
                  isActive={currentPath === item.path}
                  onClick={onClose}
                />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Main Navigation Component
function Navigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block group-hover:text-primary transition-colors">
              ESG Analytics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          currentPath={location.pathname}
        />
      )}
    </header>
  );
}

export default memo(Navigation);
