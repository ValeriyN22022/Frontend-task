import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import html2canvas from 'html2canvas';
import type {
  ChartDataPoint,
  VariationId,
  Variation,
  LineStyle,
  Theme,
} from '../../types/data';
import { getMinMaxValues } from '../../utils/data';
import bestIcon from '../../assets/images/generalbest@4x.webp';
import calendarIcon from '../../assets/images/generalcalendar@4x.webp';
import styles from './Chart.module.css';

interface ChartProps {
  data: ChartDataPoint[];
  variations: Variation[];
  selectedVariationIds: VariationId[];
  colors: string[];
  lineStyle: LineStyle;
  theme: Theme;
  onZoomStateChange?: (state: {
    isZoomed: boolean;
    canZoomIn: boolean;
    canZoomOut: boolean;
  }) => void;
}

export interface ChartRef {
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  isZoomed: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  exportToPng: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload?: ChartDataPoint;
  }>;
  label?: string;
  variationMap?: Record<VariationId, string>;
  onActiveIndexChange?: (index: number | null) => void;
  theme?: Theme;
}

function CustomTooltip({
  active,
  payload,
  label,
  variationMap,
  onActiveIndexChange,
  theme = 'light',
}: CustomTooltipProps) {
  if (!active || !payload || !label) {
    onActiveIndexChange?.(null);
    return null;
  }

  React.useEffect(() => {
    if (payload && payload[0]?.payload) {
      const payloadData = payload[0].payload as ChartDataPoint & { __index__?: number };
      const dataIndex = payloadData.__index__;
      onActiveIndexChange?.(dataIndex ?? null);
    }
  }, [payload, onActiveIndexChange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

  const tooltipClass = theme === 'dark' ? styles['tooltip-dark'] : styles.tooltip;

  return (
    <div className={tooltipClass}>
      <div className={styles['tooltip-date']}>
        <img src={calendarIcon} alt="" className={styles['tooltip-calendar-icon']} />
        {formatDate(label)}
      </div>
      {sortedPayload.map((item, index) => (
        <div key={item.dataKey} className={styles['tooltip-item']}>
          <span
            className={styles['tooltip-dot']}
            style={{ backgroundColor: item.color }}
          />
          <span className={styles['tooltip-label']}>
            {variationMap?.[item.dataKey] || item.dataKey}
            {index === 0 && (
              <img src={bestIcon} alt="" className={styles['tooltip-best-icon']} />
            )}
          </span>
          <span className={styles['tooltip-value']}>
            {item.value.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export const Chart = forwardRef<ChartRef, ChartProps>(({
  data,
  variations,
  selectedVariationIds,
  colors,
  lineStyle,
  theme,
  onZoomStateChange,
}, ref) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);

  const { min, max } = useMemo(
    () => getMinMaxValues(data, selectedVariationIds),
    [data, selectedVariationIds],
  );

  const variationMap = useMemo(
    () =>
      variations.reduce(
        (acc, v) => {
          acc[v.id] = v.name;
          return acc;
        },
        {} as Record<VariationId, string>,
      ),
    [variations],
  );

  const colorMap = useMemo(
    () =>
      variations.reduce(
        (acc, v, index) => {
          acc[v.id] = colors[index % colors.length];
          return acc;
        },
        {} as Record<VariationId, string>,
      ),
    [variations, colors],
  );

  const handleActiveIndexChange = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const formatYAxis = (tickItem: number) => {
    return `${tickItem}%`;
  };

  const yDomain = [Math.max(0, min - 5), Math.min(100, max + 5)];

  const getLineType = (): 'monotone' | 'linear' => {
    switch (lineStyle) {
      case 'smooth':
        return 'monotone';
      case 'area':
        return 'monotone';
      default:
        return 'linear';
    }
  };

  const handleZoomIn = useCallback(() => {
    const dataLength = data.length;
    if (dataLength <= 2) return;

    const endIndex = dataLength - 1;

    if (!zoomDomain) {
      const startIndex = 1;
      setZoomDomain([startIndex, endIndex]);
    } else {
      const [start] = zoomDomain;
      const newStart = Math.min(dataLength - 2, start + 1);
      setZoomDomain([newStart, endIndex]);
    }
  }, [data.length, zoomDomain]);

  const handleZoomOut = useCallback(() => {
    const dataLength = data.length;
    if (dataLength === 0) return;

    if (!zoomDomain) {
      return;
    }

    const [start] = zoomDomain;
    if (start === 0) {
      setZoomDomain(null);
    } else {
      const endIndex = dataLength - 1;
      const newStart = start - 1;
      setZoomDomain([newStart, endIndex]);
    }
  }, [data.length, zoomDomain]);

  const handleResetZoom = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  const handleExportPng = useCallback(async () => {
    if (!chartContainerRef.current) return;

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'chart.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch {
    }
  }, [theme]);

  const isZoomed = zoomDomain !== null;
  const canZoomIn =
    data.length > 2 &&
    (!isZoomed || (zoomDomain && zoomDomain[0] < data.length - 2));
  const canZoomOut = isZoomed && zoomDomain && zoomDomain[0] > 0;

  React.useEffect(() => {
    onZoomStateChange?.({
      isZoomed,
      canZoomIn,
      canZoomOut,
    });
  }, [isZoomed, canZoomIn, canZoomOut, onZoomStateChange]);

  useImperativeHandle(ref, () => ({
    resetZoom: handleResetZoom,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    isZoomed,
    canZoomIn,
    canZoomOut,
    exportToPng: handleExportPng,
  }));

  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const mappedData = data.map((item, index) => ({ ...item, __index__: index }));
    if (zoomDomain) {
      return mappedData.slice(zoomDomain[0], zoomDomain[1] + 1);
    }
    return mappedData;
  }, [data, zoomDomain]);

  const gridColor = theme === 'dark' ? '#444' : '#e5e5e5';
  const axisColor = theme === 'dark' ? '#999' : '#666';
  const backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <div
      ref={chartContainerRef}
      className={`${styles.container} ${theme === 'dark' ? styles['dark-theme'] : ''}`}
      style={{ backgroundColor }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={displayData}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            interval="preserveStartEnd"
            stroke={axisColor}
            tick={{ fill: axisColor }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={formatYAxis}
            label={{
              value: 'Конверсия (%)',
              angle: -90,
              position: 'insideLeft',
              fill: axisColor,
            }}
            stroke={axisColor}
            tick={{ fill: axisColor }}
          />
          <Tooltip
            content={
              <CustomTooltip
                variationMap={variationMap}
                onActiveIndexChange={handleActiveIndexChange}
                theme={theme}
              />
            }
            cursor={false}
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
              borderColor: theme === 'dark' ? '#555' : '#ccc',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          />
          {variations.map((variation) => {
            const id = variation.id;
            const isSelected = selectedVariationIds.includes(id);
            const color = colorMap[id] || colors[0];
            const opacity = isSelected ? 1 : 0;
            
            if (lineStyle === 'area') {
              return (
                <Area
                  key={id}
                  dataKey={id}
                  name={variationMap[id]}
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={opacity}
                  fill={color}
                  fillOpacity={isSelected ? 0.15 : 0}
                  type={getLineType()}
                  dot={false}
                  activeDot={isSelected ? { r: 6, fill: color } : false}
                  baseLine={0}
                />
              );
            }

            return (
              <Line
                key={id}
                dataKey={id}
                name={variationMap[id]}
                stroke={color}
                strokeWidth={2}
                strokeOpacity={opacity}
                dot={false}
                activeDot={isSelected ? { r: 6, fill: color } : false}
                type={getLineType()}
              />
            );
          })}
          {hoveredIndex !== null && displayData[hoveredIndex] && (
            <ReferenceLine
              x={displayData[hoveredIndex].date}
              stroke="#8884d8"
              strokeWidth={2}
              strokeDasharray="5 5"
              isFront={true}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

