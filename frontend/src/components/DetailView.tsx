// src/components/DetailView.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Paper,
    Typography,
    Stack,
    Box,
    Chip,
    Divider,
} from '@mui/material';
import type { Car } from '../api/cars';

export interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'categorical' | 'date' | 'price' | 'currency';
    unit?: string;
    color?: 'primary' | 'success' | 'info' | 'warning' | 'default' | 'secondary' | 'error';
}

interface DetailViewProps<T> {
    data: T;
    title: string;
    subtitle?: string;
    fieldConfigs: FieldConfig[];
    backUrl?: string;
    backLabel?: string;
}
const humanize = (s: string): string => s.replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const DetailView = <T extends Car>({
    data,
    title,
    subtitle,
    fieldConfigs,
    backUrl = '/',
    backLabel = 'Back to Database',
}: DetailViewProps<T>) => {
    const navigate = useNavigate();

    const allKeys = Object.keys(data);
    const configuredKeys = new Set(fieldConfigs.map((fc) => fc.key));

    const defaultConfigs: FieldConfig[] = allKeys
        .filter((key) => !configuredKeys.has(key) && key !== 'id')
        .map((key) => ({
            key,
            label: humanize(key),
            type: 'text',
        }));

    const fullConfigs = [...fieldConfigs, ...defaultConfigs];

    const midPoint = Math.ceil(fullConfigs.length / 2);
    const leftFields = fullConfigs.slice(0, midPoint);
    const rightFields = fullConfigs.slice(midPoint);

    const formatValue = (config: FieldConfig, value: unknown): string => {
        switch (config.type) {
            case 'price':
            case 'currency':
                return typeof value === 'number' ? `€${value.toLocaleString()}` : String(value);
            case 'date':
                return typeof value === 'string' ? new Date(value).toLocaleDateString() : String(value);
            case 'number':
                return typeof value === 'number'
                    ? config.unit
                        ? `${value.toLocaleString()} ${config.unit}`
                        : value.toLocaleString()
                    : String(value);
            case 'boolean':
                return value ? 'Yes' : 'No';
            default:
                return String(value ?? '');
        }
    };

    const renderField = (config: FieldConfig) => {
        const raw = (data as Record<string, unknown>)[config.key];
        const formatted = formatValue(config, raw);

        const labelBox = (
            <Typography
                variant="body1"
                sx={{
                    color: '#666',
                    minWidth: { sm: '120px' },
                    flexShrink: 0,
                }}
            >
                {config.label}:
            </Typography>
        );

        // Boolean as Chip
        if (config.type === 'boolean') {
            return (
                <Box
                    key={config.key}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                    }}
                >
                    {labelBox}
                    <Chip
                        label={formatted}
                        color={raw ? 'success' : 'default'}
                        variant="outlined"
                    />
                </Box>
            );
        }

        // Categorical as Chip
        if (config.type === 'categorical') {
            return (
                <Box
                    key={config.key}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                    }}
                >
                    {labelBox}
                    <Chip label={formatted} color={config.color ?? 'default'} variant="outlined" />
                </Box>
            );
        }

        // Default typography
        return (
            <Box
                key={config.key}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                }}
            >
                {labelBox}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color:
                            config.type === 'price' || config.type === 'currency'
                                ? '#1976d2'
                                : 'inherit',
                        textAlign: { xs: 'left', sm: 'right' },
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                        flex: 1,
                    }}
                >
                    {formatted}
                </Typography>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(backUrl)}
                        sx={{ mb: 2 }}
                    >
                        ← {backLabel}
                    </Button>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                            wordBreak: 'break-word',
                            hyphens: 'auto',
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#666',
                                mt: 1,
                                fontSize: { xs: '1rem', md: '1.25rem' },
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                <Paper
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: 'white',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 4,
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h5"
                                sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}
                            >
                                Specifications
                            </Typography>
                            <Stack spacing={2}>
                                {leftFields.map((cfg) => (
                                    <React.Fragment key={cfg.key}>
                                        {renderField(cfg)}
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h5"
                                sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}
                            >
                                Details
                            </Typography>
                            <Stack spacing={2}>
                                {rightFields.map((cfg) => (
                                    <React.Fragment key={cfg.key}>
                                        {renderField(cfg)}
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

export default DetailView;
