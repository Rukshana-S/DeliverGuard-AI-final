import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                     text-gray-600 dark:text-gray-300 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user?.name?.split(' ')[0]}
        </span>
      </div>
    </header>
  );
}
