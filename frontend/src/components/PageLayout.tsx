import { ReactNode } from 'react';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 ${className}`}>{children}</div>
      <Footer />
    </div>
  );
};

export default PageLayout;
