import express from "express";
import multer from "multer";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
const { readJSON, writeJSON, writeFile } = fs;

const imagePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/img"
);

export const getCurrentFolderPath = (currentFile) =>
  dirname(fileURLToPath(currentFile));

const publicFolderPath = join(
  getCurrentFolderPath(import.meta.url),
  "../public"
);

const writeImage = async (fileName, content) =>
  await writeFile(join(imagePath, fileName), content);

const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../data"
);

const getProducts = async () =>
  await readJSON(join(dataFolderPath, "products.json"));

const writeProducts = async (content) =>
  await writeJSON(join(dataFolderPath, "products.json"), content);

const filesRouter = express.Router();

filesRouter.post("/:id/upload",multer().single("cover"),async (req, res, next) => {
    try {
      await writeImage(req.file.originalname, req.file.buffer)
      const Products = await getProducts();
      const link = `http://localhost:3001/img/${req.file.originalname}`;
      let updatedProducts = Products.map((product) => {
        if(product._id === req.params.id){
          product.imageUrl = link
        }
        return product
        })
      await writeProducts(updatedProducts);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);
export default filesRouter;
