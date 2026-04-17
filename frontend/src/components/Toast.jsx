import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function Toast({ message, type = 'error', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose(); }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!visible) return null;

  const styles = type === 'success'
    ? 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300';

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-medium max-w-xs ${styles}`}>
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => { setVisible(false); onClose(); }} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={15} />
      </button>
    </div>
  );
}
