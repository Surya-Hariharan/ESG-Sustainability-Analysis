import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="backdrop-blur-xl bg-background/60 border-white/10 max-w-md">
        <CardContent className="p-12 text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="rounded-full">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
