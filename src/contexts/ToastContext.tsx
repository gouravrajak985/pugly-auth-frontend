import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

// Create Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ✅ Global toast function (for non-React files like api.ts)
let globalShowToast: ((message: string, type: ToastType) => void) | null = null;
export const showGlobalToast = (message: string, type: ToastType) => {
  if (globalShowToast) globalShowToast(message, type);
  else console.warn('ToastProvider not mounted yet — toast skipped.');
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    // Auto-hide after 3s
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // ✅ Assign the global toast function when mounted
  globalShowToast = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
