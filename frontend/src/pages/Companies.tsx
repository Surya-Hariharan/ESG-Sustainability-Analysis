import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';

const Companies = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="backdrop-blur-xl bg-background/60 border-white/10">
          <CardContent className="p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Companies</h1>
            <p className="text-muted-foreground">Companies page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Companies;
