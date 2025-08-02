import * as repo from './car.repository';
import { FilterModel, SortModel, SearchResponse } from './car.dto';

export const searchCars = (
  filter: FilterModel,
  sort: SortModel[],
  start: number,
  end: number
): Promise<SearchResponse> => repo.search(filter, sort, start, end);

export const getCar   = (id: number) => repo.findById(id);
export const deleteCar= (id: number) => repo.remove(id);
export const getMeta = () => repo.getMeta();