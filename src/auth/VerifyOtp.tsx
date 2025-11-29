import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { email } = useParams<{ email: string }>();
  const { showToast } = useToast();
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await api.post('users/otpverification', {
        email,
        inputOtp: otp.join(''),
      });
      console.log("Verify Otp Api Response:", response.data);
      
      // Backend returns: { statusCode, success, message, data: { user object } }
      // For OTP verification, we use the pending token from login/signup
      const pendingToken = sessionStorage.getItem('pendingAuthToken');
      
      // Use pending token if available (from login/signup flow)
      const token = pendingToken;
      const code = pendingToken || 'verified';
      
      if (token) {
        login(token);
        sessionStorage.removeItem('pendingAuthToken');
      }

      showToast('OTP verified successfully!', 'success');

      // Redirect to source domain with code and state
      let finalRedirectUrl: string | null = null;
      
      if (auth.redirectUrl) {
        // Use provided redirect URL
        finalRedirectUrl = auth.redirectUrl;
      } else if (auth.sourceDomain) {
        // Construct redirect URL from source domain (default to /cb callback path)
        const protocol = auth.sourceDomain.startsWith('http') ? '' : 'https://';
        finalRedirectUrl = `${protocol}${auth.sourceDomain}/cb`;
      }
      
      if (finalRedirectUrl) {
        const redirectUrl = new URL(finalRedirectUrl);
        // Use the code we determined above
        redirectUrl.searchParams.set('code', code);
        if (auth.state) {
          redirectUrl.searchParams.set('state', auth.state);
        }
        window.location.href = redirectUrl.toString();
      } else {
        // No redirect URL, go to dashboard
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'OTP verification failed. Please try again.';
      showToast(errorMessage, 'error');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to your email address : {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              ))}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!isComplete || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">DIDN'T RECEIVE CODE?</span>
            </div>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-black font-medium hover:underline"
            >
              Resend verification code
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
