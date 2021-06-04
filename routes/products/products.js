import express from 'express';
import uniqid from 'uniqid';
import createError from 'http-errors';
import { readProducts, writeProducts } from '../../lib/fs-tools.js';

/*
****************** products CRUD ********************
1. CREATE → POST http://localhost:3001/products (+ body)
2. READ → GET http://localhost:3001/products (+ optional query parameters)
3. READ → GET http://localhost:3001/products/:id
4. UPDATE → PUT http://localhost:3001/products/:id (+ body)
5. DELETE → DELETE http://localhost:3001/products/:id
*/

const productsRouter = express.Router();

// get all products
productsRouter.get('/', async (req, res, next) => {
  try {
    // 1. read request body
    const content = await readProducts();

    // 2. send the content as a response
    res.send(content);
  } catch (error) {
    res.send({ message: error.message });
  }
});

// get single product
productsRouter.get('/:id', async (req, res, next) => {
  try {
    // 1. read request body
    const content = await readProducts();

    // 2. filter products for id and send back content as response
    const product = content.filter((product) => product._id === req.params.id);
    if (product.length > 0) {
      res.send(product);
    } else {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} id not found!` });
    }
  } catch (error) {
    next(error);
  }
});

// create/POST product
productsRouter.post('/', async (req, res, next) => {
  try {
    // 1. read request body
    const content = await readProducts();

    const newProduct = {
      _id: uniqid(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    

    content.push(newProduct);

    await writeProducts(content);

    res.status(200).send({id:newProduct._id});
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE product
productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const content = await readProducts();

    if (content.find((product) => product._id === req.params.id)) {
      const newProduct = content.filter(
        (content) => content._id !== req.params.id
      );
      await writeProducts(newProduct);
      res.send();
    } else {
      res
        .status(404)
        .send({ message: `product with ${req.params.id} id not found!` });
    }
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// update/PUT product
productsRouter.put('/:id', async (req, res, next) => {
  try {
    const content = await readProducts();

    if (content.find((product) => product._id === req.params.id)) {
      const product = content.findIndex(
        (product) => product._id === req.params.id
      );
      const newProduct = {
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date(),
      };
      content[product] = newProduct;
      await writeProducts(content);
      res.send({id: newProduct._id});
    } else {
      res
        .status(404)
        .send({ message: `product with ${req.params.id} id not found!` });
    }
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

export default productsRouter;
