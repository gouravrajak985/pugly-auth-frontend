import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { LayoutDashboard } from 'lucide-react';


export function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <Button variant="outline">
            Sign out
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
            <CardDescription>
              Your account has been successfully verified and you're now logged in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is your dashboard where you can manage your account and access various features.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
