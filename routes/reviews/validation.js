import { body } from 'express-validator';

export const reviewValidation = [
  body('comment').exists().withMessage('This field is mandatory'),
  body('rate')
    .exists()
    .withMessage('You have to provide a rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('The number must with within the range from 1 to 5'),
];
