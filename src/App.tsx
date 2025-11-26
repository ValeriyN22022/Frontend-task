import { useState, useMemo, useRef } from 'react';
import { VariationSelector } from './components/VariationSelector/VariationSelector';
import { TimeRangeSelector } from './components/TimeRangeSelector/TimeRangeSelector';
import { LineStyleSelector } from './components/LineStyleSelector/LineStyleSelector';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { ZoomControls } from './components/ZoomControls/ZoomControls';
import { Chart, type ChartRef } from './components/Chart/Chart';
import { parseVariations, getDataForVariations } from './utils/data';
import type {
  VariationId,
  TimeRange,
  LineStyle,
  Theme,
} from './types/data';
import styles from './App.module.css';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

function App() {
  const variations = useMemo(() => parseVariations(), []);
  const [selectedVariationIds, setSelectedVariationIds] = useState<VariationId[]>(
    variations.map((v) => v.id),
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [theme, setTheme] = useState<Theme>('light');
  const [lineStyle, setLineStyle] = useState<LineStyle>('line');
  const chartRef = useRef<ChartRef>(null);

  const chartData = useMemo(
    () => getDataForVariations(selectedVariationIds, timeRange),
    [selectedVariationIds, timeRange],
  );

  const [zoomState, setZoomState] = useState<{
    isZoomed: boolean;
    canZoomIn: boolean;
    canZoomOut: boolean;
  }>({
    isZoomed: false,
    canZoomIn: true,
    canZoomOut: false,
  });

  const handleExport = () => {
    chartRef.current?.exportToPng();
  };

  const handleZoomIn = () => {
    chartRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    chartRef.current?.zoomOut();
  };

  const handleZoomReset = () => {
    chartRef.current?.resetZoom();
  };

  const handleZoomStateChange = (state: typeof zoomState) => {
    setZoomState(state);
  };

  const appClass =
    theme === 'dark'
      ? `${styles.container} ${styles['dark-theme']}`
      : styles.container;

  return (
    <div className={appClass}>
      <h1 className={styles.title}>Interactive Line Chart</h1>
      <div className={styles.controls}>
        <div className={styles['control-group']}>
          <label className={styles['control-label']}>Вариации:</label>
          <VariationSelector
            variations={variations}
            selectedIds={selectedVariationIds}
            onSelectionChange={setSelectedVariationIds}
            theme={theme}
          />
        </div>
        <div className={styles['control-group']}>
          <label className={styles['control-label']}>Период:</label>
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
            theme={theme}
          />
        </div>
        <div className={styles['control-group']}>
          <label className={styles['control-label']}>Стиль линий:</label>
          <LineStyleSelector
            value={lineStyle}
            onChange={setLineStyle}
            theme={theme}
          />
        </div>
        <div className={styles['control-group']}>
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleZoomReset}
            canZoomIn={zoomState.canZoomIn}
            canZoomOut={zoomState.canZoomOut}
            isZoomed={zoomState.isZoomed}
            theme={theme}
          />
        </div>
        <div className={styles['control-group']}>
          <button
            type="button"
            className={styles['export-button']}
            onClick={handleExport}
          >
            Экспорт PNG
          </button>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </div>
      <Chart
        ref={chartRef}
        data={chartData}
        variations={variations}
        selectedVariationIds={selectedVariationIds}
        colors={CHART_COLORS}
        lineStyle={lineStyle}
        theme={theme}
        onZoomStateChange={handleZoomStateChange}
      />
    </div>
  );
}

export default App;
