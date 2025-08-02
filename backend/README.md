# BMW IT Internship – Backend API for Electric-Car DataGrid

A lightweight **Express + MySQL** backend that powers the AG-Grid component required by the BMW aptitude test.  
It exposes REST endpoints for **search, filter, sort, pagination, view and delete** operations on a dataset of electric vehicles.

---

## Quick Start

| Step | Command |
|------|---------|
| 1. Install | `npm install` |
| 2. Environment | `cp .env.example .env` & edit credentials |
| 3. Database | see [Database Setup](#-database-setup) |
| 4. Seed | `npm run seed` |
| 5. Dev | `npm run dev` → http://localhost:4000 |

---

## Project Structure

```
bmw-datagrid-backend/
├── src
│   ├── app.ts                 # Express bootstrap
│   ├── server.ts              # HTTP server entry
│   ├── config/
│   │   └── db.ts              # MySQL pool
│   ├── modules/cars
│   │   ├── car.dto.ts         # TypeScript interfaces
│   │   ├── car.mapper.ts      # Row ⇆ DTO conversion
│   │   ├── car.repository.ts  # SQL + pagination logic
│   │   ├── car.service.ts     # Business layer
│   │   └── car.routes.ts      # HTTP routes
│   ├── shared
│   │   ├── utils/
│   │   │   ├── asyncWrapper.ts
│   │   │   └── validation.ts
│   │   └── middlewares/
│   │       └── errorHandler.ts
├── uploads/
│   └── BMW_Aptitude_Test_Test_Data_ElectricCarData.csv
├── ddl.sql                    # MySQL schema
├── .env.example
└── README.md
```

---

## Database Setup

### MySQL

```bash
mysql -u root -p < ddl.sql
```
ddl.sql is used to created db and the table

---
### Populating DB
```bash
npm run seed
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev`   | Auto-reload TS with tsx |
| `npm run build` | Output to `dist/` |
| `npm start`     | Run production build |
| `npm run seed`  | Import CSV into MySQL (Run once to populate db) |

---

## API Reference

### 1. Server-side search / filter / sort / pagination
**`POST /api/cars/`**

Body (AG-Grid format):
```json
{
  "startRow": 0,
  "endRow": 100,
  "filterModel": {
    "brand": { "type": "contains", "filter": "bmw" },
    "rangeKm": { "type": "greaterThan", "filter": 300 },
    "date": { 
      "filterType": "date", 
      "type": "equals", 
      "dateFrom": "2024-01-17" 
    },
    "model": {
      "filterType": "text",
      "operator": "OR",
      "conditions": [
        { "type": "endsWith", "filter": "Tesla" },
        { "type": "contains", "filter": "BMW" }
      ]
    }
  },
  "sortModel": [
    { "colId": "priceEuro", "sort": "asc" }
  ]
}
```

Response:
```json
{
  "rows": [ /* …array of CarDTO… */ ],
  "lastRow": 42
}
```
### 2. Fetch Column Names
**`GET /api/cars/:id`**

### 2. Fetch single car (detail page)
**`GET /api/cars/:id`**

### 3. Delete car (AG-Grid action)
**`DELETE /api/cars/:id`**

---

## Supported AG-Grid Operators

### **Simple Filters**
| Type        | SQL mapping |
|-------------|-------------|
| `contains`, `startsWith`, `endsWith` | `LIKE %val%`, `val%`, `%val` |
| `notContains` | `NOT LIKE %val%` |
| `equals`    | `=` |
| `notEqual`  | `!=` |
| `blank` / `notBlank` | `IS NULL`, `IS NOT NULL` |
| `lessThan`, `greaterThan` | `<`, `>` |
| `lessThanOrEqual`, `greaterThanOrEqual` | `<=`, `>=` |
| `inRange`   | `BETWEEN … AND …` |

### **Complex Filters with AND/OR Conditions**
The API supports complex filter conditions with multiple criteria per column:

```json
{
  "brand": {
    "filterType": "text",
    "operator": "AND",
    "conditions": [
      {
        "filterType": "text",
        "type": "endsWith",
        "filter": "a"
      },
      {
        "filterType": "text",
        "type": "contains",
        "filter": "a"
      }
    ]
  }
}
```

**Supported Operators:**
- `"AND"` - All conditions must be true
- `"OR"` - Any condition can be true
