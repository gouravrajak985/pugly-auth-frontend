import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';



export function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    const response = await api.post('api/v1/users/register', {
      username,
      email,
      password,
    });
    console.log("Register Api Response:", response.data);

   navigate(`/verify-otp/${encodeURIComponent(email)}`);
    showToast('Sign-up successful! Please verify your email.', 'success');
    // Simulate successful sign-up
  };
  const handleClickSignIn = () => {
    navigate("/signin");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-black"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-black hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-black hover:underline">
                  Privacy Policy
                </button>
              </label>
            </div>
            <Button type="submit" className="w-full">
              Create account
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
            Already have an account?{' '}
            <button
              type="button"
              className="text-black font-medium hover:underline"
              onClick={handleClickSignIn}
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
