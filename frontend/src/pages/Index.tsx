import Sidebar from '@/components/Sidebar';
import HeroSection from '@/components/HeroSection';
import FeaturesGrid from '@/components/FeaturesGrid';

const Index = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-72 transition-all duration-300">
        <HeroSection />
        <FeaturesGrid />
      </main>
    </div>
  );
};

export default Index;