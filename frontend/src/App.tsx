import { lazy, Suspense, memo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout, ErrorBoundary } from '@/components';
import { TooltipProvider } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';

// Lazy load pages for code splitting
const Index = lazy(() => import('@/pages/Index'));
const Companies = lazy(() => import('@/pages/Companies'));
const Sectors = lazy(() => import('@/pages/Sectors'));
const Controversies = lazy(() => import('@/pages/Controversies'));
const Predictor = lazy(() => import('@/pages/Predictor'));
const Reports = lazy(() => import('@/pages/Reports'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Page loading fallback
const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading page...</p>
      </div>
    </div>
  );
});

// App Routes Component - Separated for cleaner structure
const AppRoutes = memo(function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/sectors" element={<Sectors />} />
      <Route path="/controversies" element={<Controversies />} />
      <Route path="/predictor" element={<Predictor />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
