import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { type ColDef, type GridReadyEvent, type IDatasource } from 'ag-grid-community';
import { Box, Button, debounce, TextField, Typography, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { filterCars, deleteCar, getMeta } from '../api/cars';
import { themeMaterial } from 'ag-grid-community';

const STORAGE_KEYS = {
  QUICK_FILTER: 'datagrid_quick_filter',
  FILTER_MODEL: 'datagrid_filter_model',
  SORT_MODEL: 'datagrid_sort_model'
};

const DataGrid: React.FC = () => {
  const navigate = useNavigate();
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [quickFilter, setQuickFilter] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUICK_FILTER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored;
      }
    }
    return '';
  });
  const quickFilterRef = React.useRef(quickFilter);


  const boolFormatter = ({ value }: { value: boolean }) => (value ? 'Yes' : 'No');

  const saveState = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }, []);

  const loadState = useCallback((key: string, defaultValue: any = null) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
      return defaultValue;
    }
  }, []);

  useEffect(() => {
    saveState(STORAGE_KEYS.QUICK_FILTER, quickFilter);
  }, [quickFilter, saveState]);

  useEffect(() => {
    getMeta().then(res => {

      setColDefs([
        ...res.data.map((c: { field: string; type: string }) => ({
          field: c.field,
          headerName: c.field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          filter: c.type === 'number' ? 'agNumberColumnFilter'
            : c.type === 'date' ? 'agDateColumnFilter'
              : 'agTextColumnFilter',
          sortable: true,
          flex: 1,
          minWidth: 120,
          hide: c.field === 'id',
          ...(c.type === 'boolean' && { valueFormatter: boolFormatter }),
          ...(c.type === 'number' && {
            valueFormatter: (params: { value: number }) => {
              if (c.field.includes('euro')) {
                return params.value ? `€${params.value.toLocaleString()}` : '';
              }
              return params.value;
            }
          }),
        })),
        {
          headerName: 'Actions',
          sortable: false,
          filter: false,
          width: 180,
          pinned: 'right',
          cellRenderer: (p: { data: { id: number } }) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/cars/${p.data.id}`)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onDelete(p.data.id)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                Delete
              </Button>
            </Box>
          )
        }
      ])
    });
  }, [navigate]);
  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this car?')) return;
    await deleteCar(id);
    gridRef.current?.api.refreshInfiniteCache();
  };


  const buildDataSource = useCallback((): IDatasource => ({
    getRows: async (params) => {
      console.log(params.filterModel);

      try {
        const body = {
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel ?? [],
          filterModel: params.filterModel ?? {},
        };
        if (quickFilterRef.current) {
          body.filterModel.global = { type: 'contains', filter: quickFilterRef.current };
        }
        const res = await filterCars(body)
        console.log(res);

        params.successCallback(res.rows, res.lastRow);
      } catch {
        params.failCallback();
      }
    },
  }), []);

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      const api = event.api;
      api.setGridOption('datasource', buildDataSource());
    },
    [buildDataSource]
  );

  const onFirstDataRendered = useCallback(
    (event: any) => {
      const api = event.api;
      const savedFilterModel = loadState(STORAGE_KEYS.FILTER_MODEL, {});
      if (Object.keys(savedFilterModel).length > 0) {
        console.log('Restoring filter model:', savedFilterModel);
        api.setFilterModel(savedFilterModel);
      }
      const savedSortModel = loadState(STORAGE_KEYS.SORT_MODEL, []);
      if (savedSortModel.length > 0) {
        console.log('Restoring sort model:', savedSortModel);
        api.applyColumnState({
          state: savedSortModel.map((sort: any) => ({
            colId: sort.colId,
            sort: sort.sort
          })),
          defaultState: { sort: null }
        });
      }
    },
    [loadState, saveState]
  );

  const onFilterChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const filterModel = gridRef.current.api.getFilterModel();
      saveState(STORAGE_KEYS.FILTER_MODEL, filterModel);
    }
  }, [saveState]);

  const onSortChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const sortModel = gridRef.current.api.getColumnState()
        .filter((col: any) => col.sort)
        .map((col: any) => ({ colId: col.colId, sort: col.sort }));
      saveState(STORAGE_KEYS.SORT_MODEL, sortModel);
    }
  }, [saveState]);

  const handleQuick = useMemo(() =>
    debounce(() => {
      if (gridRef.current?.api) {
        gridRef.current.api.setGridOption('datasource', buildDataSource());
      }
    }, 500),
    [buildDataSource]
  );

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, md: 3 },
      p: { xs: 2, md: 3 },
      minHeight: '100vh'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        gap: { xs: 2, md: 0 },
        mb: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 600,
            color: '#1a1a1a',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}>
            Electric Car Database
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Search and filter through our comprehensive electric vehicle catalog
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Quick Search"
            size="small"
            placeholder="Search cars by brand, model, or features..."
            value={quickFilter}
            onChange={(e) => {
              const value = e.target.value;
              setQuickFilter(value);
              quickFilterRef.current = value;
              handleQuick();
            }}
            sx={{
              width: { xs: '100%', md: 350 },
              minWidth: { xs: 'auto', md: 350 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    🔍
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setQuickFilter('');
              quickFilterRef.current = '';
              if (gridRef.current?.api) {
                gridRef.current.api.setFilterModel({});
                gridRef.current.api.applyColumnState({
                  state: [],
                  defaultState: { sort: null }
                });
                Object.values(STORAGE_KEYS).forEach(key => {
                  localStorage.removeItem(key);
                });
                gridRef.current.api.setGridOption('datasource', buildDataSource());
              }
            }}
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 1,
              fontSize: '0.875rem',
              textTransform: 'none',
              height: 40
            }}
          >
            Reset All
          </Button>
        </Box>
      </Box>

      <Box sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Box sx={{
          height: { xs: '500px', sm: '600px', md: '700px' },
          width: '100%'
        }}>
          <AgGridReact
            theme={themeMaterial}
            ref={gridRef}
            columnDefs={colDefs}
            defaultColDef={{
              flex: 1,
              minWidth: 120,
              sortable: true,
              filter: true,
              resizable: true,
              cellStyle: {
                padding: '8px 12px'
              },
            }}
            rowModelType="infinite"
            cacheBlockSize={100}
            maxBlocksInCache={10}
            onGridReady={onGridReady}
            onFirstDataRendered={onFirstDataRendered}
            onFilterChanged={onFilterChanged}
            onSortChanged={onSortChanged}
            rowHeight={50}
            headerHeight={60}
            suppressRowHoverHighlight={false}
            suppressCellFocus={true}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DataGrid;