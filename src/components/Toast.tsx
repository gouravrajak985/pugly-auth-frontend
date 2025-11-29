import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgGlow: 'shadow-green-500/20',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgGlow: 'shadow-red-500/20',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bgGlow: 'shadow-blue-500/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgGlow: 'shadow-yellow-500/20',
  },
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={cn(
          'relative overflow-hidden rounded-full px-6 py-4 shadow-2xl backdrop-blur-xl',
          'bg-gradient-to-br from-gray-900 via-black to-gray-900',
          'border border-white/10',
          config.bgGlow,
          'min-w-[320px] max-w-md'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className={cn('flex-shrink-0', config.color)}>
            <Icon className="h-5 w-5" strokeWidth={2.5} />
          </div>

          <p className="flex-1 text-sm font-medium text-white/90 pr-2 text-center">
            {message}
          </p>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cn(
            'absolute bottom-0 left-0 h-0.5',
            config.color.replace('text-', 'bg-'),
            'animate-progress'
          )}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}
