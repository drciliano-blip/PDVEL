'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [tema, setTema] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    Promise.resolve().then(() => {
      const atual = document.documentElement.getAttribute('data-theme');
      setTema(atual === 'dark' ? 'dark' : 'light');
    });
  }, []);

  function alternar() {
    const novo = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', novo);
    localStorage.setItem('pdv-theme', novo);
    setTema(novo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      title="Alternar tema claro/escuro"
      className="w-9 h-9 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-muted"
    >
      {tema === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
