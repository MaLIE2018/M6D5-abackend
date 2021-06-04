import express from 'express';
import cors from 'cors';
import reviewsRouter from './routes/reviews/reviews.js';
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  catchAllErrorHandler,
} from './routes/errorsHandler.js';
import filesRouter from './modules/files/fileHandler.js';
import { getCurrentFolderPath } from './modules/files/fileHandler.js';
import { join } from 'path';
import productsRouter from './routes/products/products.js';
import listEndpoints from "express-list-endpoints"

const app = express();
const port = process.env.PORT || 3001

const publicFolderPath = join(
  getCurrentFolderPath(import.meta.url),
  './public'
);

app.use(express.static(publicFolderPath));
app.use(cors());
app.use(express.json());

app.use('/products', filesRouter, productsRouter);
app.use('/reviews', reviewsRouter);

app.use(badRequestErrorHandler);
app.use(notFoundErrorHandler);
app.use(catchAllErrorHandler);

console.table(listEndpoints(app))

app.listen(port, () => console.log(`Server at ${port}`));
app.on('error', (error) => console.log(`Server is not running: ${error}`));
