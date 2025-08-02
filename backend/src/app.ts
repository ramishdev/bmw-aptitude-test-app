import express from 'express';
import cors from 'cors';
import carRoutes from './modules/cars/car.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cars', carRoutes);
app.use(errorHandler);

export default app;