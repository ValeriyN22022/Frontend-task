import type { TimeRange, Theme } from '../../types/data';
import styles from './TimeRangeSelector.module.css';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  theme?: Theme;
}

const rangeMap: Record<TimeRange, string> = {
  day: 'День',
  week: 'Неделя',
};

export function TimeRangeSelector({
  value,
  onChange,
  theme = 'light',
}: TimeRangeSelectorProps) {
  const selectClass =
    theme === 'dark'
      ? `${styles.select} ${styles['dark-theme']}`
      : styles.select;

  return (
    <select
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as TimeRange)}
    >
      {Object.entries(rangeMap).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

