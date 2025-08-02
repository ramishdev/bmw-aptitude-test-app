import { Request, Response, Router } from 'express';
import * as service from './car.service';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { SearchRequest } from './car.dto';
import { validateSearchRequest } from '../../shared/utils/validation';

const router = Router();

// GET /api/cars?brand_like=BMW&rangeKm_gt=350
router.post(
    '/',
    asyncWrapper(async (req: Request, res: Response) => {
      try {
        validateSearchRequest(req.body);               
      } catch (err: unknown) {
        const error = err as Error;
        return res.status(400).json({ error: error.message });
      }
      const { startRow, endRow, filterModel, sortModel }: SearchRequest = req.body;      
      const result = await service.searchCars(filterModel, sortModel, startRow, endRow);
      res.json(result);
    })
  );
  
// GET /api/cars/meta
router.get('/meta', asyncWrapper(async (_req: Request, res: Response) => {  
  const meta = await service.getMeta();
  res.json(meta);
}));

// GET /api/cars/:id
router.get(
  '/:id',
  asyncWrapper(async (req: Request, res: Response) => {
    const car = await service.getCar(Number(req.params.id));
    car ? res.json(car) : res.status(404).end();
  }),
);

// DELETE /api/cars/:id  (for "Delete" action in AG-Grid)
router.delete(
  '/:id',
  asyncWrapper(async (req: Request, res: Response) => {
    const ok = await service.deleteCar(Number(req.params.id));
    res.status(ok ? 204 : 404).end();
  }),
);


export default router;