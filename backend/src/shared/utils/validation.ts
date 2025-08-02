import { SearchRequest } from '../../modules/cars/car.dto';

export function validateSearchRequest(body: unknown): asserts body is SearchRequest {
  if (typeof body !== 'object' || body === null)
    throw new Error('Request body must be a JSON object');

  const requestBody = body as Record<string, unknown>;

  if (!('startRow' in requestBody) || typeof requestBody.startRow !== 'number' || requestBody.startRow < 0)
    throw new Error('startRow is required and must be a non-negative number');

  if (!('endRow' in requestBody) || typeof requestBody.endRow !== 'number' || requestBody.endRow < requestBody.startRow)
    throw new Error('endRow is required and must be >= startRow');

  if (!('filterModel' in requestBody) || typeof requestBody.filterModel !== 'object')
    throw new Error('filterModel is required and must be an object');

  if (!('sortModel' in requestBody) || !Array.isArray(requestBody.sortModel))
    throw new Error('sortModel is required and must be an array');
}