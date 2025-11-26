import type { Theme } from '../../types/data';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className={styles['theme-toggle']}
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      aria-label="Переключить тему"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}


