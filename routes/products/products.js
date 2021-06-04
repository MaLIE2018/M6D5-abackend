

import express from 'express';
import uniqid from 'uniqid';
import createError from 'http-errors';
import { readProducts, writeProducts } from '../../lib/fs-tools.js';
import Products from "./productSchema.js"
import q2m from "query-to-mongo"
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
  // price, category, 
  
  try {
    const total = await Products.countDocuments()
    let query = q2m(req.query)
 
    let products = []
    if(query.criteria.query){
      products = await Products.find({$text: {$search:query.criteria.query}}, {}, query.options)
    } else{
      if(query.criteria.query){
        let search = query.criteria.query
        delete query.criteria.query
        query = {$and:[query.criteria,{$text: {$search:search}} ]}
        products = await Products.find(query, {}, query.options)  
      } else{
        products = await Products.find(query.criteria, {}, query.options)
      }
    }
    res.status(200).send({links: query.links("/products", total),total, products})
  } catch (error) {
    console.log("getProductsError", error)
    res.send({ message: error.message });
  }
});

// get single product
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product= await Products.findById(req.params.id)
    if (product) {
      res.send(product);
    } else {
     next(createError(404, {message: "Product not found."}))
    }
  } catch (error) {
    next(error);
  }
});

// create/POST product
productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new Products(req.body)
    const {_id} = await newProduct.save()
    res.status(200).send({ id: _id });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE product
productsRouter.delete("/:id", async (req, res, next) => {
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
productsRouter.put("/:id", async (req, res, next) => {
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
      res.send({ id: newProduct._id });
    } else {
      res
        .status(404)
        .send({ message: `product with ${req.params.id} id not found!` });
    }
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// comments endpoints **************************

productsRouter.post("/:id/comments/", async (req, res, next) => {
  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: req.body,
        },
      },
      { runValidators: true, new: true }
    );
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(createError(404, {message:`Product ${req.params.id} not found`}));
    }
  } catch (error) {
    console.log(error);
    next(createError(500,{message: "An error occurred while adding the comment"}));
  }
});

productsRouter.get("/:id/comments/", async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.id);
    if (product) {
      res.send(product.comments);
    } else {
      next(createError(404, {message:`product ${req.params.id} not found`}));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, {message:"An error occurred while fetching the comments"}));
  }
});

productsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const product = await Products.findOne(
      {
        _id: req.params.id,
      },
      {
        comments: {
          $elemMatch: { _id: req.params.commentId },
        },
      }
    );
    if (product) {
      const { comments } = product;
      if (comments && comments.length > 0) {
        res.send(comments[0]);
      } else {
        next(
          createError(
            404,
            {message:`Comment ${req.params.commentId} not found in comments`}
          )
        );
      }
    } else {
      next(createError(404, {message:`product ${req.params.id} not found`}));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "An error occurred while updating the comment"));
  }
});

productsRouter.delete("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const product = await Products.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: { _id: req.params.commentId },
        },
      },
      {
        new: true,
      }
    );
    if (product) {
      res.send(product);
    } else {
      next(createError(404, {message:`product ${req.params.id} not found`}));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, {message:"An error occurred while deleting the comment"}));
  }
});

productsRouter.put("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const product = await Products.findOneAndUpdate(
      {
        _id: req.params.id,
        "comments._id": req.params.commentId,
      },
      { $set: { "comments.$": req.body } },
      {
        runValidators: true,
        new: true,
      }
    );
    if (product) {
      res.send(product);
    } else {
      next(createError(404, {message:`product ${req.params.id} not found`}));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "An error occurred while updating the comment"));
  }
});

export default productsRouter;
