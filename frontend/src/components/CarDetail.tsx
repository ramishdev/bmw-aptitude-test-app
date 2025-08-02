import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Paper,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { getCar, type Car } from '../api/cars';

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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
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

  const formatPrice = (price: number) => `€${price.toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const formatFieldValue = (key: string, value: number|string|boolean) => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('price')) {
        return formatPrice(value);
      }
      if (key.toLowerCase().includes('kmh') || key.toLowerCase().includes('km/h')) {
        return `${value} km/h`;
      }
      if (key.toLowerCase().includes('km')) {
        return `${value.toLocaleString()} km`;
      }
      if (key.toLowerCase().includes('whkm') || key.toLowerCase().includes('wh/km')) {
        return `${value} Wh/km`;
      }
      if (key.toLowerCase().includes('sec') || key.toLowerCase().includes('seconds')) {
        return `${value} seconds`;
      }
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string' &&key.toLowerCase().includes('date')) {
        return formatDate(value);
    }
    return value;
  };

  const renderField = (key: string, value: number|string|boolean) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        if (typeof value === 'boolean') {
      return (
        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ color: '#666' }}>{label}:</Typography>
          <Chip
            label={value ? 'Yes' : 'No'}
            color={value ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>
      );
    }

    const categoricalFields = ['body_style', 'segment', 'power_train', 'plug_type'];
    if (categoricalFields.includes(key)) {
      const colors : Record<string, 'primary'|'success'|'info'|'warning'|'default'|'secondary'|'error'> = {
        body_style: 'primary',
        segment: 'success',
        power_train: 'info',
        plug_type: 'warning'
      };
      
      return (
        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ color: '#666' }}>{label}:</Typography>
          <Chip label={value} color={colors[key]??'default'} variant="outlined" />
        </Box>
      );
    }

    return (
      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ color: '#666' }}>{label}:</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: key === 'price_euro' ? '#1976d2' : 'inherit' }}>
          {formatFieldValue(key, value)}
        </Typography>
      </Box>
    );
  };

  const allFields = Object.entries(car).filter(([key]) => key !== 'id');
  const midPoint = Math.ceil(allFields.length / 2);
  const leftFields = allFields.slice(0, midPoint);
  const rightFields = allFields.slice(midPoint);

  return (
    <Box sx={{
      p: { xs: 2, md: 3 },
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            ← Back to Database
          </Button>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
            }}
          >
            {car.brand} {car.model}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              mt: 1,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Electric Vehicle Details
          </Typography>
        </Box>

        <Paper sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white'
        }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Left Column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                Specifications
              </Typography>
              <Stack spacing={2}>
                {leftFields.map(([key, value]) => (
                  <React.Fragment key={key}>
                    {renderField(key, value)}
                    <Divider />
                  </React.Fragment>
                ))}
              </Stack>
            </Box>

            {/* Right Column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                Details
              </Typography>
              <Stack spacing={2}>
                {rightFields.map(([key, value]) => (
                  <React.Fragment key={key}>
                    {renderField(key, value)}
                    <Divider />
                  </React.Fragment>
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CarDetail;