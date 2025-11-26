import type { Variation, VariationId, Theme } from '../../types/data';
import styles from './VariationSelector.module.css';

interface VariationSelectorProps {
  variations: Variation[];
  selectedIds: VariationId[];
  onSelectionChange: (ids: VariationId[]) => void;
  theme?: Theme;
}

export function VariationSelector({
  variations,
  selectedIds,
  onSelectionChange,
  theme = 'light',
}: VariationSelectorProps) {
  const handleToggle = (id: VariationId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      }
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const containerClass =
    theme === 'dark'
      ? `${styles.container} ${styles['dark-theme']}`
      : styles.container;

  return (
    <div className={containerClass}>
      {variations.map((variation) => {
        const isSelected = selectedIds.includes(variation.id);
        return (
          <label key={variation.id} className={styles.label}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(variation.id)}
              disabled={isSelected && selectedIds.length === 1}
              className={styles.checkbox}
            />
            <span className={styles.name}>{variation.name}</span>
          </label>
        );
      })}
    </div>
  );
}

