import fs from 'fs';
import csv from 'csv-parser';
import { pool } from '../config/db';
import path from 'path';

// Define interface for CSV row data
interface CSVRow {
  Brand: string;
  Model: string;
  AccelSec: string;
  TopSpeed_KmH: string;
  Range_Km: string;
  Efficiency_WhKm: string;
  FastCharge_KmH: string;
  RapidCharge: string;
  PowerTrain: string;
  PlugType: string;
  BodyStyle: string;
  Segment: string;
  Seats: string;
  PriceEuro: string;
  Date: string;
}

const seed = async () => {
  const stream = fs.createReadStream(
    path.join(__dirname, '../../uploads/BMW_Aptitude_Test_Test_Data_ElectricCarData.csv'),
  );

  const rows: CSVRow[] = [];
  stream
    .pipe(csv())
    .on('data', (row: CSVRow) => rows.push(row))
    .on('end', async () => {
      for (const r of rows) {
        await pool.execute(
          `INSERT INTO cars (
            brand, model, accel_sec, top_speed_kmh, range_km,
            efficiency_whkm, fast_charge_kmh, rapid_charge,
            power_train, plug_type, body_style, segment,
            seats, price_euro, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, STR_TO_DATE(?, '%m/%d/%y'))`,
          [
            r.Brand.trim(),
            r.Model.trim(),
            r.AccelSec,
            r.TopSpeed_KmH,
            r.Range_Km,
            r.Efficiency_WhKm,
            r.FastCharge_KmH === '-' ? null : r.FastCharge_KmH,
            r.RapidCharge === 'Yes' ? 1 : 0,
            r.PowerTrain,
            r.PlugType,
            r.BodyStyle,
            r.Segment,
            r.Seats,
            r.PriceEuro,
            r.Date,
          ],
        );
      }
      console.log('✅ Seeding complete');
      process.exit(0);
    });
};

seed();