import type { LineStyle, Theme } from '../../types/data';
import styles from './LineStyleSelector.module.css';

interface LineStyleSelectorProps {
  value: LineStyle;
  onChange: (value: LineStyle) => void;
  theme?: Theme;
}

const stylesMap: Record<LineStyle, string> = {
  line: 'Линия',
  smooth: 'Плавная',
  area: 'Зона',
};

export function LineStyleSelector({
  value,
  onChange,
  theme = 'light',
}: LineStyleSelectorProps) {
  const selectClass =
    theme === 'dark'
      ? `${styles.select} ${styles['dark-theme']}`
      : styles.select;

  return (
    <select
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as LineStyle)}
    >
      {Object.entries(stylesMap).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

