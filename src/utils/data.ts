import type {
  Variation,
  VariationId,
  RawDataPoint,
  ProcessedDataPoint,
  ChartDataPoint,
  TimeRange,
} from '../types/data';
import dataJson from '../../data.json';

export function parseVariations(): Variation[] {
  return dataJson.variations.map((v) => ({
    id: v.id?.toString() || '0',
    name: v.name,
  }));
}

export function calculateConversionRate(
  conversions: number,
  visits: number,
): number {
  if (visits === 0) return 0;
  return (conversions / visits) * 100;
}

export function processRawData(
  rawData: RawDataPoint[],
): ProcessedDataPoint[] {
  const allVariationIds = parseVariations().map((v) => v.id);
  
  return rawData.map((point) => {
    const variations: ProcessedDataPoint['variations'] = {};

    allVariationIds.forEach((id) => {
      const visits = point.visits[id] || 0;
      const conversions = point.conversions[id] || 0;
      variations[id] = {
        visits,
        conversions,
        conversionRate: calculateConversionRate(conversions, visits),
      };
    });

    return {
      date: point.date,
      variations,
    };
  });
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekKey(date: Date): string {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split('T')[0];
}

export function aggregateByTimeRange(
  data: ProcessedDataPoint[],
  timeRange: TimeRange,
): ProcessedDataPoint[] {
  if (timeRange === 'day') {
    return data;
  }

  const grouped = new Map<string, ProcessedDataPoint>();

  data.forEach((point) => {
    const date = new Date(point.date);
    const weekKey = formatWeekKey(date);
    const existing = grouped.get(weekKey);

    if (!existing) {
      const variations: ProcessedDataPoint['variations'] = {};
      Object.keys(point.variations).forEach((id) => {
        const v = point.variations[id];
        variations[id] = {
          visits: v.visits,
          conversions: v.conversions,
          conversionRate: v.conversionRate,
        };
      });
      grouped.set(weekKey, {
        date: weekKey,
        variations,
      });
    } else {
      Object.keys(point.variations).forEach((id) => {
        const existingVariation = existing.variations[id];
        const currentVariation = point.variations[id];

        if (existingVariation && currentVariation) {
          existingVariation.visits += currentVariation.visits;
          existingVariation.conversions += currentVariation.conversions;
          existingVariation.conversionRate = calculateConversionRate(
            existingVariation.conversions,
            existingVariation.visits,
          );
        } else if (currentVariation) {
          existing.variations[id] = {
            visits: currentVariation.visits,
            conversions: currentVariation.conversions,
            conversionRate: currentVariation.conversionRate,
          };
        }
      });
    }
  });

  return Array.from(grouped.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function convertToChartData(
  data: ProcessedDataPoint[],
): ChartDataPoint[] {
  const allVariationIds = parseVariations().map((v) => v.id);
  
  return data.map((point) => {
    const chartPoint: ChartDataPoint = {
      date: point.date,
    };

    allVariationIds.forEach((id) => {
      const variation = point.variations[id];
      chartPoint[id] = variation ? variation.conversionRate : 0;
    });

    return chartPoint;
  });
}

export function getDataForVariations(
  timeRange: TimeRange,
): ChartDataPoint[] {
  const rawData = dataJson.data as RawDataPoint[];
  const processed = processRawData(rawData);
  const aggregated = aggregateByTimeRange(processed, timeRange);
  return convertToChartData(aggregated);
}

export function getMinMaxValues(
  data: ChartDataPoint[],
  variationIds: VariationId[],
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  data.forEach((point) => {
    variationIds.forEach((id) => {
      const value = point[id] as number;
      if (typeof value === 'number') {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });
  });

  return {
    min: min === Infinity ? 0 : Math.floor(min),
    max: max === -Infinity ? 100 : Math.ceil(max),
  };
}

