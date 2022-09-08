const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { request } = require("../../app");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({ 
  storage: storage,
  limits: {
  fileSize: 1024 * 1024 * 5 
  },
  fileFilter
});
// const storage = multer.diskStorage({
//   destination: function(req,file,cb) {
//     cb(null, './uploads/');
//   },
//   filename: function(req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });

const Product = require("../models/product");

//------- GET all the products-------
router.get("/", (req, res, next) => {
  // console.log(req);
  Product.find()
    .select("_id name price productImage")
    .exec()
    .then((docs) => {
      // console.log(docs);
      const response = {
        count: docs.length,
        products: docs.map((doc) => {  
          console.log(doc.productImage);
          console.log(doc.name);
          console.log(doc._id);
          return {
            productImage: doc.productImage,
            name: doc.name,
            price: doc.price, 
            id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })

    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//------------POST a Product------------
router.post("/", upload.single("productImage"), (req, res, next) => {
  console.log(req.file);
  console.log(req.file.path);
  //---creating an instance of the schema Product----
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  console.log(product);
  product
    .save()
    .then((result) => { 
      // console.log(result);
      res.status(201).json({
        message: "Product Added",
        createdProduct: {
          name: result.name,
          price: result.price,
          id: result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    });
});

//------------GET Product By ID-------------
router.get("/:productid", (req, res, next) => {
  console.log(req);
  const id = req.params.productid;
  Product.findById(id)
    .select("name price _id  productImage")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          products: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + id,
          },
        });
      } else {
        res.status(404).json({ message: "No Valid Id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//-----------PATCH----------------
router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product Updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//-----------DELETE a Product------------
router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
