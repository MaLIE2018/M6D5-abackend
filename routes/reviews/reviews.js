import express from 'express';
import uniqid from 'uniqid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import { reviewValidation } from './validation.js';
import { validationResult } from 'express-validator';
import createError from 'http-errors';

const { readJSON, writeJSON } = fs;

const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../data'
);

const getReviews = async () =>
  await readJSON(join(dataFolderPath, 'reviews.json'));
const writeReviews = async (content) =>
  await writeJSON(join(dataFolderPath, 'reviews.json'), content);

const reviewsRouter = express.Router();

//---------------ROUTES----------- //

reviewsRouter.get('/', async (req, res, next) => {
  try {
    const reviews = await getReviews();
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});
reviewsRouter.get('/:id', async (req, res, next) => {
  try {
    const allReviews = await getReviews();
    const reviewsFromProduct = allReviews.filter((review) => review._id === req.params.id);
    res.send(reviewsFromProduct);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reviewsRouter.post('/',  async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }));
    } else {
      const allReviews = await getReviews();
      const newReview = { id: uniqid(), ...req.body, createdAt: new Date() };

      allReviews.push(newReview);
      await writeReviews(allReviews);
      res.status(201).send({ id: newReview.id });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

reviewsRouter.put('/:id', reviewValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }));
    } else {
      const allReviews = await getReviews();
      const remainReviews = allReviews.filter(
        (review) => review.id !== req.params.id
      );
      const modifiedReview = {
        id: req.params.id,
        ...req.body,
        modifiedAt: new Date(),
      };
      remainReviews.push(modifiedReview);
      await writeReviews(remainReviews);
      res.send(modifiedReview);
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete('/:id', async (req, res, next) => {
  try {
    const allReviews = await getReviews();
    const remainReviews = allReviews.filter(
      (review) => review.id !== req.params.id
    );
    await writeReviews(remainReviews);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default reviewsRouter;
