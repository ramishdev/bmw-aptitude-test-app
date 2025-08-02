import { RowDataPacket } from 'mysql2';
import { CarDTO } from './car.dto';

export const toDTO = (row: RowDataPacket): CarDTO => ({
  id: row.id,
  brand: row.brand,
  model: row.model,
  accel_sec: parseFloat(row.accel_sec),
  top_speed_kmh: row.top_speed_kmh,
  range_km: row.range_km,
  efficiency_whkm: row.efficiency_whkm,
  fast_charge_kmh: row.fast_charge_kmh,
  rapid_charge: row.rapid_charge,
  power_train: row.power_train,
  plug_type: row.plug_type,
  body_style: row.body_style,
  segment: row.segment,
  seats: row.seats,
  price_euro: row.price_euro,
  date: row.date.split('T')[0],
});