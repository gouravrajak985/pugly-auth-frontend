import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Lock, Mail } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';


export function CheckUser() {
  const [email, setEmail] = useState('');
//   const navigate = useNavigate();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleClickSignUp = async () => {
     const res = await fetch(`http://localhost:4000/auth/check-user?email=${encodeURIComponent(email)}`);
     const data = await res.json();
     console.log(data);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Continue to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Continue with Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-black font-medium hover:underline"
              onClick={handleClickSignUp}
            >
              Sign Up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
