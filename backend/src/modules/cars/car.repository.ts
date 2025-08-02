import { pool } from '../../config/db';
import { FilterModel, SortModel, QueryParams, CountResult, CarRow, DeleteResult, DescribeRow } from './car.dto';
import { toDTO } from './car.mapper';

const buildWhereClause = (filterModel: FilterModel) => {
  let sql = '';
  const params: QueryParams = {};

  if (filterModel?.global) {
    const g = filterModel.global;
    if (g.type === 'contains') {
      sql += ` AND (
            LOWER(brand)            LIKE LOWER(:global) OR
            LOWER(model)            LIKE LOWER(:global) OR
            LOWER(segment)          LIKE LOWER(:global) OR
            LOWER(body_style)       LIKE LOWER(:global) OR
            LOWER(power_train)      LIKE LOWER(:global) OR
            LOWER(plug_type)        LIKE LOWER(:global) OR
            LOWER(rapid_charge)     LIKE LOWER(:global) OR
            CAST(accel_sec AS CHAR) LIKE LOWER(:global) OR
            CAST(top_speed_kmh AS CHAR) LIKE LOWER(:global) OR
            CAST(range_km AS CHAR)      LIKE LOWER(:global) OR
            CAST(efficiency_whkm AS CHAR) LIKE LOWER(:global) OR
            CAST(fast_charge_kmh AS CHAR) LIKE LOWER(:global) OR
            CAST(seats AS CHAR)         LIKE LOWER(:global) OR
            CAST(price_euro AS CHAR)    LIKE LOWER(:global) OR
            CAST(date AS CHAR)          LIKE LOWER(:global)
        )`;
      params.global = `%${g.filter}%`;
    }
  }

  filterModel && Object.entries(filterModel).forEach(([col, f]) => {
    if (col === 'global') return;

    const colSql = snakeCase(col);
    const key = col.replace(/[^a-zA-Z0-9]/g, '');

    // Handle complex conditions with AND/OR operators
    if (f.conditions && f.conditions.length > 0) {
      const conditions = f.conditions.map((condition, index) => {
        const conditionKey = `${key}_${index}`;
        const conditionSql = snakeCase(col);
        const isDateField = condition.filterType === 'date';

        if (isDateField) {
          condition.dateFrom = condition.dateFrom ? condition.dateFrom?.split('T')[0] : condition.dateFrom;
          condition.dateTo = condition.dateTo ? condition.dateTo?.split('T')[0] : condition.dateTo;
        }

        return buildConditionSql(condition, conditionSql, conditionKey, params);
      });

      const operator = f.operator || 'AND';
      sql += ` AND (${conditions.join(` ${operator} `)})`;
    } else {
      const isDateField = f.filterType === 'date';
      if (isDateField) {
        f.dateFrom = f.dateFrom ? f.dateFrom?.split('T')[0] : f.dateFrom;
        f.dateTo = f.dateTo ? f.dateTo?.split('T')[0] : f.dateTo;
      }

      const conditionSql = buildConditionSql(f, colSql, key, params);
      if (conditionSql) {
        sql += ` AND ${conditionSql}`;
      }
    }
  });

  return { sql, params };
};

const buildConditionSql = (f: any, colSql: string, key: string, params: QueryParams): string => {
  const isDateField = f.filterType === 'date';

  switch (f.type) {
    case 'contains':
      params[key] = `%${String(f.filter).toLowerCase()}%`;
      return `LOWER(${colSql}) LIKE :${key}`;

    case 'notContains':
      params[key] = `%${String(f.filter).toLowerCase()}%`;
      return `LOWER(${colSql}) NOT LIKE :${key}`;

    case 'equals':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `${colSql} = :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} = :${key}`;
      }

    case 'notEqual':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `DATE(${colSql}) != :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} != :${key}`;
      }

    case 'startsWith':
      if (isDateField) {
        params[key] = `${String(f.dateFrom)}%`;
        return `DATE(${colSql}) LIKE :${key}`;
      } else {
        params[key] = `${String(f.filter).toLowerCase()}%`;
        return `LOWER(${colSql}) LIKE :${key}`;
      }

    case 'endsWith':
      if (isDateField) {
        params[key] = `%${String(f.dateFrom)}`;
        return `DATE(${colSql}) LIKE :${key}`;
      } else {
        params[key] = `%${String(f.filter).toLowerCase()}`;
        return `LOWER(${colSql}) LIKE :${key}`;
      }

    case 'blank':
      return `(${colSql} IS NULL)`;

    case 'notBlank':
      return `${colSql} IS NOT NULL`;

    case 'lessThan':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `DATE(${colSql}) < :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} < :${key}`;
      }

    case 'lessThanOrEqual':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `${colSql} <= :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} <= :${key}`;
      }

    case 'greaterThan':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `DATE(${colSql}) > :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} > :${key}`;
      }

    case 'greaterThanOrEqual':
      if (isDateField) {
        params[key] = f.dateFrom;
        return `DATE(${colSql}) >= :${key}`;
      } else {
        params[key] = f.filter;
        return `${colSql} >= :${key}`;
      }

    case 'inRange':
      if (isDateField) {
        params[`${key}0`] = f.dateFrom;
        params[`${key}1`] = f.dateTo;
        return `DATE(${colSql}) BETWEEN :${key}0 AND :${key}1`;
      } else {
        params[`${key}0`] = f.filter;
        params[`${key}1`] = f.filterTo;
        return `${colSql} BETWEEN :${key}0 AND :${key}1`;
      }

    default:
      console.warn(`Unknown filter type: ${f.type} for column ${colSql}`);
      return '';
  }
};

const buildOrderClause = (sortModel: SortModel[]) => {
  return sortModel && sortModel.length
    ? `ORDER BY ` +
    sortModel.map(s => `${snakeCase(s.colId)} ${s.sort.toUpperCase()}`).join(', ')
    : '';
}
const snakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const search = async (filter: FilterModel, sort: SortModel[], start: number, end: number) => {
  const { sql: whereSql, params } = buildWhereClause(filter);
  const orderSql = buildOrderClause(sort);

  const [countRows] = await pool.execute<CountResult[]>(
    `SELECT COUNT(*) as total FROM cars WHERE 1=1 ${whereSql}`,
    params
  );

  const total = countRows[0].total;

  const limit = end - start;
  const [rows] = await pool.execute<CarRow[]>(
    `SELECT * FROM cars WHERE 1=1 ${whereSql} ${orderSql} LIMIT ${Number(start)}, ${Number(limit)}`,
    params
  );

  return {
    rows: rows.map(toDTO),
    lastRow: total
  };
};

export const findById = async (id: number) => {
  const [rows] = await pool.execute<CarRow[]>(`SELECT * FROM cars WHERE id = ?`, [id]);
  return (rows && rows.length) ? toDTO(rows[0]) : null;
};

export const remove = async (id: number) => {
  const [result] = await pool.execute<DeleteResult>(`DELETE FROM cars WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const getMeta = async () => {
  const [rows] = await pool.execute<DescribeRow[]>('DESCRIBE cars');

  return rows.map(c => ({
    field: c.Field,
    type: c.Type.startsWith('int') || c.Type.startsWith('decimal') ? 'number' :
      c.Type.startsWith('date') ? 'date' : 'text'
  }));
};