import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/companies', label: 'Companies' },
    { path: '/sectors', label: 'Sectors' },
    { path: '/predictor', label: 'Predictor' },
    { path: '/controversies', label: 'Controversies' },
    { path: '/reports', label: 'Reports' },
    { path: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Floating Navigation */}
      <nav
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
          'w-[95%] max-w-7xl mx-auto'
        )}
      >
        <div
          className={cn(
            'backdrop-blur-xl bg-background/60 border border-white/10 rounded-2xl shadow-2xl',
            'transition-all duration-300',
            isScrolled ? 'shadow-lg bg-background/80' : 'shadow-xl'
          )}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
                  <Leaf className="h-8 w-8 text-primary relative z-10 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ESG Analytics
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'relative rounded-xl transition-all duration-200',
                        location.pathname === item.path
                          ? 'text-primary font-semibold'
                          : 'text-foreground/70 hover:text-foreground'
                      )}
                    >
                      {location.pathname === item.path && (
                        <span className="absolute inset-0 bg-primary/10 rounded-xl" />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start rounded-xl',
                        location.pathname === item.path
                          ? 'text-primary font-semibold bg-primary/10'
                          : 'text-foreground/70 hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-24" />
    </>
  );
};

export default Navigation;
