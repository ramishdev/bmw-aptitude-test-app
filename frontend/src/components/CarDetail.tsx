// src/components/CarDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Box, CircularProgress, Alert } from '@mui/material';
import DetailView, { type FieldConfig } from './DetailView';
import { getCar, type Car } from '../api/cars';

const carFieldConfigs: FieldConfig[] = [
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'segment', label: 'Segment', type: 'categorical', color: 'success' },
  { key: 'body_style', label: 'Body Style', type: 'categorical', color: 'primary' },
  { key: 'seats', label: 'Seats', type: 'number' },
  { key: 'power_train', label: 'Power Train', type: 'categorical', color: 'info' },
  { key: 'plug_type', label: 'Plug Type', type: 'categorical', color: 'warning' },
  { key: 'rapid_charge', label: 'Rapid Charge', type: 'boolean' },
  { key: 'range_km', label: 'Range', type: 'number', unit: 'km' },
  { key: 'top_speed_kmh', label: 'Top Speed', type: 'number', unit: 'km/h' },
  { key: 'accel_sec', label: 'Acceleration', type: 'number', unit: 'seconds' },
  { key: 'efficiency_whkm', label: 'Efficiency', type: 'number', unit: 'Wh/km' },
  { key: 'fast_charge_kmh', label: 'Fast Charge', type: 'number', unit: 'km/h' },
  { key: 'price_euro', label: 'Price', type: 'price' },
  { key: 'date', label: 'Date', type: 'date' }
];

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCar(Number(id))
      .then(setCar)
      .catch(() => setError('Failed to load car details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !car) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Car not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Database
        </Button>
      </Box>
    );
  }

  return (
    <DetailView
      data={car}
      title={car.brand && car.model ? `${car.brand} ${car.model}` : "Detail"}
      subtitle="Electric Vehicle Details"
      fieldConfigs={carFieldConfigs}
      backUrl="/"
      backLabel="Back to Database"
    />
  );
};

export default CarDetail;
