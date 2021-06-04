import express from 'express';
import cors from 'cors';
import reviewsRouter from './routes/reviews/reviews.js';
import {badRequest, notFound, forbidden,catchAll } from "./modules/errorHandler.js"
import filesRouter from './modules/files/fileHandler.js';
import { getCurrentFolderPath } from './modules/files/fileHandler.js';
import { join } from 'path';
import productsRouter from './routes/products/products.js';
import listEndpoints from "express-list-endpoints"


const app = express();
const port = process.env.PORT || 3001;

const whiteList = [process.env.WT_DEV_FE, process.env.WT_PROD_FE]


const corsOptions = {
  origin: function(origin, next){
    if (whiteList.indexOf(origin)===-1) {
        next(createError(403,{message:"Origin not allowed"}))
    }else{
        next(null, true)
    }
  }
}


const publicFolderPath = join(
  getCurrentFolderPath(import.meta.url),
  "./public"
);

app.use(express.static(publicFolderPath));
app.use(cors(corsOptions));
app.use(express.json());

app.use("/products", filesRouter, productsRouter);
app.use("/reviews", reviewsRouter);

app.use(badRequest, notFound, forbidden,catchAll);


console.table(listEndpoints(app));

app.listen(port, () => console.log(`Server at ${port}`));
app.on("error", (error) => console.log(`Server is not running: ${error}`));
