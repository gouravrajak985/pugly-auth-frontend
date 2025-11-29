import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Lock, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setSourceDomain, setRedirectInfo, login: loginUser } = useAuth();
  const { showToast } = useToast();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if user exists
  const checkUserExists = useCallback(async (emailToCheck: string) => {
    setIsCheckingEmail(true);
    setError('');

    try {
      const response = await api.post('users/check-user', {
        email: emailToCheck.trim(),
      });

      console.log('Check user API full response:', response);
      console.log('Check user API response.data:', response.data);
      
      // Backend returns: { statusCode, success, message, data: { exists, email } }
      const responseData = response.data;
      const exists = responseData?.data?.exists ?? false;
      
      console.log('User exists check result:', exists);
      
      if (exists === true) {
        setShowPasswordForm(true);
        showToast('User found. Please enter your password.', 'success');
      } else {
        setError('User not found. Please sign up instead.');
        showToast('User not found. Please sign up to create an account.', 'info');
        setShowPasswordForm(false);
      }
    } catch (err: unknown) {
      console.error('Check user error details:', err);
      const errorResponse = err as { response?: { data?: { message?: string; success?: boolean } }; message?: string };
      const errorMessage = 
        errorResponse?.response?.data?.message ||
        errorResponse?.message ||
        'Failed to check user. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setShowPasswordForm(false);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [showToast]);

  // Get email from navigation state if available
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      // If email is provided, automatically check if user exists
      if (location.state.email) {
        checkUserExists(location.state.email);
      }
    }
  }, [location.state, checkUserExists]);

  // Capture source domain, redirect URL, and state from URL query parameter if not already set
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const redirectUrl = urlParams.get('redirectUrl');
    const state = urlParams.get('state');
    
    if (source && !auth.sourceDomain) {
      setSourceDomain(source);
    }
    
    if ((redirectUrl || state) && (!auth.redirectUrl || !auth.state)) {
      setRedirectInfo(redirectUrl || null, state || null);
    }
  }, [auth.sourceDomain, auth.redirectUrl, auth.state, setSourceDomain, setRedirectInfo]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    await checkUserExists(email);
  };

  // Handle sign in with password
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Password is required');
      showToast('Password is required', 'error');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      showToast('Email is required', 'error');
      return;
    }

    setIsSigningIn(true);

    try {
      console.log('Attempting login with email:', email.trim());
      const response = await api.post('users/login', {
        email: email.trim(),
        password,
      });

      console.log('Sign in API full response:', response);
      console.log('Sign in API response.data:', response.data);

      // Backend returns: { statusCode, success, message, data: { user, accessToken } }
      const responseData = response.data;
      const token = responseData?.data?.accessToken;
      
      console.log('Access token received:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('No access token received from server');
      }

      // Based on backend logic, login only succeeds if user is already verified
      // So we can directly use the token for authentication
      loginUser(token);
      showToast('Login successful!', 'success');
      
      // Redirect based on auth context (source domain, redirect URL, etc.)
      if (auth.redirectUrl) {
        const redirectUrl = new URL(auth.redirectUrl);
        redirectUrl.searchParams.set('code', token);
        if (auth.state) {
          redirectUrl.searchParams.set('state', auth.state);
        }
        window.location.href = redirectUrl.toString();
      } else if (auth.sourceDomain) {
        const protocol = auth.sourceDomain.startsWith('http') ? '' : 'https://';
        const redirectUrl = `${protocol}${auth.sourceDomain}/cb?code=${token}${auth.state ? `&state=${auth.state}` : ''}`;
        window.location.href = redirectUrl;
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Sign in error details:', err);
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = 
        errorResponse?.response?.data?.message ||
        errorResponse?.message ||
        'Sign in failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleClickSignUp = () => {
    navigate("/signup", { state: { email } });
  };

  const handleBackToEmail = () => {
    setShowPasswordForm(false);
    setPassword('');
    setError('');
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
          <CardTitle className="text-center">
            {showPasswordForm ? 'Enter your password' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center">
            {showPasswordForm 
              ? 'Enter your password to sign in' 
              : 'Enter your email to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            // Email form
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isCheckingEmail}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCheckingEmail || !email.trim()}
              >
                {isCheckingEmail ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          ) : (
            // Password form
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-display">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-display"
                    type="email"
                    value={email}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-xs text-gray-600 hover:text-black transition-colors mt-1"
                >
                  Change email
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-gray-600 hover:text-black transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isSigningIn}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSigningIn || !password.trim()}
              >
                {isSigningIn ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!showPasswordForm && (
            <>
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
                  Sign up
                </button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
