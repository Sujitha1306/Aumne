import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border max-w-sm animate-fade-in transition-all
              ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}
            `}
          >
            <div className="pt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
            </div>
            <span className="text-sm font-medium flex-grow">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 text-current opacity-50 hover:opacity-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
