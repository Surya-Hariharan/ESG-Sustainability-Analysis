import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';

const About = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="backdrop-blur-xl bg-background/60 border-white/10">
          <CardContent className="p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">About</h1>
            <p className="text-muted-foreground">About page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default About;
