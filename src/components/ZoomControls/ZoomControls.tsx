import type { Theme } from '../../types/data';
import styles from './ZoomControls.module.css';
import reloadIcon from '../../assets/images/technicalrefresh.webp';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isZoomed: boolean;
  theme?: Theme;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
  isZoomed,
  theme = 'light',
}: ZoomControlsProps) {
  const buttonClass =
    theme === 'dark'
      ? `${styles['zoom-button']} ${styles['dark-theme']}`
      : styles['zoom-button'];

  const zoomButtonsClass =
    theme === 'dark'
      ? `${styles['zoom-buttons']} ${styles['dark-theme-buttons']}`
      : styles['zoom-buttons'];

  return (
    <div className={styles.container}>
      <div className={zoomButtonsClass}>
        <button
          type="button"
          className={buttonClass}
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Уменьшить"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6H10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Увеличить"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2V10M2 6H10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <button
        type="button"
        className={`${styles['reset-button']} ${
          theme === 'dark' ? styles['dark-theme'] : ''
        }`}
        onClick={onReset}
        disabled={!isZoomed}
        aria-label="Сбросить зум"
      >
        <img src={reloadIcon} alt="Сбросить" className={styles['reset-icon']} />
      </button>
    </div>
  );
}

