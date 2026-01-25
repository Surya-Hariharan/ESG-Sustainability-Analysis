import { Link } from 'react-router-dom';
import { Leaf, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Companies', path: '/companies' },
      { label: 'Sectors', path: '/sectors' },
      { label: 'Predictor', path: '/predictor' },
      { label: 'Reports', path: '/reports' },
    ],
    company: [
      { label: 'About', path: '/about' },
      { label: 'Controversies', path: '/controversies' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
    ],
    resources: [
      { label: 'Documentation', href: '#', external: true },
      { label: 'API Reference', href: '#', external: true },
      { label: 'Blog', href: '#', external: true },
      { label: 'Support', href: '#', external: true },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@esganalytics.com', label: 'Email' },
  ];

  return (
    <footer className="relative border-t border-white/10 backdrop-blur-xl bg-background/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
                <Leaf className="h-8 w-8 text-primary relative z-10 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ESG Analytics
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Empowering sustainable investment decisions through AI-driven ESG analytics and
              comprehensive risk assessment.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} ESG Analytics Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  );
};

export default Footer;
