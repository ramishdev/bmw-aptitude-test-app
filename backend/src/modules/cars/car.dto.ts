import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CarDTO {
  id: number;
  brand: string;
  model: string;
  accel_sec: number;
  top_speed_kmh: number;
  range_km: number;
  efficiency_whkm: number;
  fast_charge_kmh: number;
  rapid_charge: boolean;
  power_train: string;
  plug_type: string;
  body_style: string;
  segment: string;
  seats: number;
  price_euro: number;
  date: string;
}

export type FilterModel = Record<string, FilterItem>;
export interface FilterSub {
  type: 'contains' | 'equals' | "notEqual" | "notContains" | 'startsWith' | 'endsWith' | 'blank' | 'notBlank' | 'lessThan' | 'greaterThan' | "greaterThanOrEqual" | 'lessThanOrEqual' | 'inRange';
  filter?: string | number | [number, number];
  filterType: 'text' | 'number' | 'date'
  filterTo?: string | number | [number, number];
  dateFrom?: string;
  dateTo?: string;
}
export interface FilterItem extends FilterSub {
  operator?: "AND" | "OR",
  conditions?: [FilterSub]
}
/* AG-Grid server-side sort model */
export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

/* request body coming from AG-Grid */
export interface SearchRequest {
  startRow: number;
  endRow: number;
  filterModel: FilterModel;
  sortModel: SortModel[];
}

/* response body expected by AG-Grid */
export interface SearchResponse {
  rows: CarDTO[];
  lastRow: number;
}

/* Database types */
export interface QueryParams {
  [key: string]: string | number | Date | [number, number] | undefined;
}

export interface CountResult extends RowDataPacket {
  total: number;
}

export interface CarRow extends RowDataPacket, CarDTO { }

export interface DeleteResult extends ResultSetHeader {
  affectedRows: number;
}

export interface DescribeRow extends RowDataPacket {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}