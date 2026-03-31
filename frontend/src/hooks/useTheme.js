import { useState, useEffect } from 'react';

const AUTH_ROUTES = ['/login', '/register', '/onboarding', '/setup/'];

function isAuthRoute() {
  return AUTH_ROUTES.some((r) => window.location.pathname.startsWith(r));
}

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (isAuthRoute()) return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isAuthRoute()) {
      document.documentElement.classList.remove('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const forceLight = () => {
    document.documentElement.classList.remove('dark');
    setDark(false);
  };

  return { dark, toggle, forceLight };
}
