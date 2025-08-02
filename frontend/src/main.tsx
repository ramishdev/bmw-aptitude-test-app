import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import App from './App';

ModuleRegistry.registerModules([AllCommunityModule]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
