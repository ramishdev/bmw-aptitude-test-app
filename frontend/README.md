# BMW IT Internship – Frontend

A React application for BMW IT Internship. Built with TypeScript and Material-UI, featuring a generic DataGrid component that can adapt to different data structures.

## What it does

This app provides a comprehensive interface for exploring data with features like:
- **Search & Filter**: Find item by any feature
- **Sort & Organize**: Sort by any column with smooth animations
- **View Details**: Click on any car to see full specifications

## Tech Stack

- **React 19** - Latest React with all the new features
- **TypeScript** - For better code quality and fewer bugs
- **Material-UI** - Professional-looking components out of the box
- **AG Grid** - Powerful data grid for handling large datasets
- **Vite** - Super fast development and building

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend server running (see backend README)

### Environment Setup
Copy the example environment file and configure it:
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
# VITE_API_URL=http://localhost:4000
```

### Installation & Running
```bash
# Install everything
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DataGrid.tsx      # The main data table
│   │   ├── CarDetail.tsx     # Individual car page
|   |   └── DetailView.tsx    
│   ├── api/
│   │   └── cars.tsx          # API calls and data types
│   └── App.tsx               # Main app component
```

## Key Features

### DataGrid Component
The main table that displays all the data. It's designed to be generic:
- **Dynamic Columns**: Automatically generates columns from API metadata
- **Infinite Scrolling**: Loads data as you scroll
- **Smart Search**: Type in the search box and it finds entity across all fields
- **Column Filters**: Each column has its own filter for precise searching
- **Smooth Sorting**: Click any column header to sort
- **Responsive**: Adapts to your screen size automatically

### Performance Optimizations
- **Virtual Scrolling**: Only renders the rows you can see (handles thousands of data smoothly)
- **Debounced Search**: Waits 500ms after you stop typing before searching (prevents too many API calls)
- **Smart Caching**: Remembers data you've already loaded

### State Persistence
The DataGrid automatically saves and restores your session state using browser localStorage:

#### **Persisted State:**
- **Quick Search**: Your search terms are remembered
- **Column Filters**: All filter conditions are preserved
- **Column Sorting**: Sort order and direction are maintained
- **Reset Functionality**: "Reset All" button clears everything

#### **How It Works:**
```typescript
// State is automatically saved when you:
- Type in the search box
- Apply column filters
- Sort columns

// State is automatically restored when you:
- Navigate back to the grid
- Refresh the page
- Close and reopen the browser
```

#### **Storage Keys:**
- `datagrid_quick_filter` - Search terms
- `datagrid_filter_model` - Filter conditions
- `datagrid_sort_model` - Sort configuration

#### **Benefits:**
- **Seamless UX** - No need to re-apply filters after navigation
- **Workflow Continuity** - Pick up where you left off
- **Browser Persistent** - State survives browser restarts
- **Privacy Friendly** - Data stays in your browser only

### Code Quality
- TypeScript for type safety
- ESLint for consistent code style
- Modern React patterns (hooks, functional components)

## Data Model

Each car in the database has these fields:
```typescript
interface Car {
  id: number;
  brand: string;           // e.g., "Tesla"
  model: string;           // e.g., "Model 3"
  price_euro: number;      // Price in euros
  range_km: number;        // Range in kilometers
  top_speed_kmh: number;   // Top speed
  accel_sec: number;       // 0-100 acceleration time
  efficiency_whkm: number; // Energy efficiency
  fast_charge_kmh: number; // Fast charging speed
  rapid_charge: string;   // Supports rapid charging
  power_train: string;     // e.g., "AWD"
  plug_type: string;       // e.g., "Type 2"
  body_style: string;      // e.g., "Sedan"
  segment: string;         // e.g., "D"
  seats: number;           // Number of seats
  date: string;            // Release date
}
```

## BMW Requirements Analysis

### Fully Implemented:
1. **Generic DataGrid Component** - Works with any column structure
2. **Search Feature** - Backend API integration with global search
3. **Filtering** - All required filter types (contains, equals, startsWith, etc.)
4. **Backend Service** - Express.js APIs for data operations
5. **MySQL Database** - Proper setup with CSV seeding

### Limitations:
- **Backend**: Currently specific to cars table (would need modifications for other datasets)
- **Detail Page**: Generic field rendering but some info and css specific to car data structure

## Environment Variables

The application requires the following environment variables:

|    Variable    |      Description      |         Default         | Required |
|----------------|-----------------------|-------------------------|----------|
| `VITE_API_URL` | Backend API base URL  | `http://localhost:4000` |    Yes   |

### Development vs Production
- **Development**: `VITE_API_URL=http://localhost:4000`
- **Production**: Set to your deployed backend URL

## Backend Integration

The frontend connects to a Node.js/Express backend that provides:
- RESTful API endpoints for data
- Pagination for large datasets
- Server-side filtering and sorting
- Proper error handling

---

Built for the BMW Aptitude Test with modern web technologies and best practices.
