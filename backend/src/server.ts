import dotenv from 'dotenv';
import app from './app';

dotenv.config();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`BMW backend listening on ${PORT}`));