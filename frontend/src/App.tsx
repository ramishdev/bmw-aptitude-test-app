import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import DataGrid from './components/DataGrid';
import CarDetail from './components/CarDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{height:'400px'}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DataGrid />} />
          <Route path="/cars/:id" element={<CarDetail />} />
        </Routes>
      </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;