const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { request } = require("../../app");

const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Order.find()
    .select("_id product quantity")
    .populate("product")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/" + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
// res.status(200).json({
//     message: ' Orders were fetched'
// })

router.post("/", (req, res, next) => {
  Product.findById(req.params.productId)
    .then((product) => {
      //     if(!product) {
      //     return res.status(404).json({
      //         message: 'Not Found'
      //     });
      // }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order Placed",
        createdOrder: {
          id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
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
// res.status(201).json({
//     message: 'Orders were created',
//     order: order
// })

router.get("/:orderid", (req, res, next) => {
  const id = req.params.orderid;
  Order.findById(id)
    .select("product quantity _id")
    .populate("product",'name')
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          order: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders/" + id,
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

router.delete("/:orderid", (req, res, next) => {
  const id = req.params.productId;
  Order.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order Deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders/",
          body: { productId: "ID", quantity: "Number" },
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

module.exports = router;
