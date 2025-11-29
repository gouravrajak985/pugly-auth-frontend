import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Lock, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function CheckUser() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setSourceDomain, setRedirectInfo } = useAuth();
  const [searchParams] = useSearchParams();

  // Capture source domain, redirect URL, and state from URL query parameter on mount
  useEffect(() => {
    const source = searchParams.get('source');
    const redirectUrl = searchParams.get('redirectUrl');
    const state = searchParams.get('state');
    
    if (source) {
      setSourceDomain(source);
      console.log('Source domain captured:', source);
    }
    
    if (redirectUrl || state) {
      setRedirectInfo(redirectUrl || null, state || null);
      console.log('Redirect info captured:', { redirectUrl, state });
    }
  }, [searchParams, setSourceDomain, setRedirectInfo]);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!email.trim()) {
      setError('Email is required');
      showToast('Email is required', 'error');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://10.190.25.126:4000/api/v1/users/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message || errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log('Check user API response:', data);
      
      // Handle success based on API response
      // Adjust this logic based on your actual API response structure
      if (data.exists === true || data.userExists === true || data.found === true) {
        showToast('User found. Redirecting to sign in...', 'success');
        navigate('/signin', { state: { email } });
      } else {
        showToast('User not found. Redirecting to sign up...', 'info');
        navigate('/signup', { state: { email } });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check user. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Check user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickSignUp = () => {
    navigate('/signup');
  };

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  className={`pl-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? 'Checking...' : 'Continue with Email'}
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
