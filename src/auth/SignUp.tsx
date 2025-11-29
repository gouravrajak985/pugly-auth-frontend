import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { auth, setSourceDomain, setRedirectInfo } = useAuth();

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

      const data = response.data;
      console.log('Check user API response:', data);
      
      // Backend returns: { statusCode, success, message, data: { exists, email } }
      const exists = data.data?.exists || false;
      
      if (exists) {
        setUserExists(true);
        setError('User already exists. Please sign in instead.');
        showToast('User already exists. Please sign in to continue.', 'info');
      } else {
        setUserExists(false);
        setShowSignupForm(true);
        showToast('Email available. Please complete your registration.', 'success');
      }
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to check user. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Check user error:', err);
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


  // Handle signup form submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSigningUp(true);

    try {
      // Prepare registration payload with role if available
      const registrationData: {
        username: string;
        email: string;
        password: string;
        role?: string;
      } = {
        username,
        email,
        password,
      };

      // Include role if source domain is set
      if (auth.role) {
        registrationData.role = auth.role;
        console.log('Registering with role:', auth.role, 'from domain:', auth.sourceDomain);
      }

      const response = await api.post('users/register', registrationData);
      console.log("Register Api Response:", response.data);

      navigate(`/verify-otp/${encodeURIComponent(email)}`);
      showToast('Sign-up successful! Please verify your email.', 'success');
    } catch (err: unknown) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Sign-up failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Signup error:', err);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleClickSignIn = () => {
    navigate("/signin", { state: { email } });
  };

  const handleBackToEmail = () => {
    setShowSignupForm(false);
    setUserExists(false);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">
            {showSignupForm ? 'Create an account' : 'Sign up'}
          </CardTitle>
          <CardDescription className="text-center">
            {showSignupForm 
              ? 'Enter your information to get started' 
              : 'Enter your email to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showSignupForm ? (
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
                {userExists && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      This email is already registered. Please{' '}
                      <button
                        type="button"
                        onClick={handleClickSignIn}
                        className="font-medium underline hover:text-blue-900"
                      >
                        sign in
                      </button>
                      {' '}instead.
                    </p>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCheckingEmail || !email.trim() || userExists}
              >
                {isCheckingEmail ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          ) : (
            // Signup form
            <form onSubmit={handleSignupSubmit} className="space-y-4">
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
                    disabled={isSigningUp}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isSigningUp}
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
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isSigningUp}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-black"
                  required
                  disabled={isSigningUp}
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
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSigningUp || !username.trim() || !password.trim() || !confirmPassword.trim()}
              >
                {isSigningUp ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          )}
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
