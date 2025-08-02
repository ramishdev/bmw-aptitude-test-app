import type { IGetRowsParams } from 'ag-grid-community';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export interface Car {
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
interface body{
    startRow: number,
    endRow: number,
    sortModel: IGetRowsParams['sortModel'],
    filterModel: IGetRowsParams['filterModel'],
  };
export const filterCars = (body: body) => axios.post(`${API}/cars`, body).then(r => r.data);
export const getCar = (id: number) => axios.get(`${API}/cars/${id}`).then(r => r.data);
export const deleteCar = (id: number) => axios.delete(`${API}/cars/${id}`);
export const getMeta = () => axios.get(`${API}/cars/meta`);