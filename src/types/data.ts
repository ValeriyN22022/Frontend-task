export type VariationId = string;

export interface Variation {
  id: VariationId;
  name: string;
}

export interface RawDataPoint {
  date: string;
  visits: Record<VariationId, number>;
  conversions: Record<VariationId, number>;
}

export interface ProcessedDataPoint {
  date: string;
  variations: Record<VariationId, {
    visits: number;
    conversions: number;
    conversionRate: number;
  }>;
}

export interface ChartDataPoint {
  date: string;
  [variationId: string]: string | number;
}

export type TimeRange = 'day' | 'week';

export type LineStyle = 'line' | 'smooth' | 'area';

export type Theme = 'light' | 'dark';

