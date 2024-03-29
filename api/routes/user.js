const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  

const User = require('../models/user')
 //-------------Signup User---------------------//
router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
        if (user.length >= 1) {
                return res.status(409).json({
                message: 'Mail Exists'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return  res.status(500).json({
                        error:err
                    });
                } else { 
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash 
                    });
                    user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            }) ;
        }  
    });   
    });

    //-------------Login User---------------------//
    router.post('/login', (req, res, next) => {
        User.find({ email: req.body.email })
        .exec()
        .then(user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        message: 'Authorization failed'
                        });
                    }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                       if (err) {
                        return res.status(401).json({
                            message: 'Authorization failed'
                            });
                       }
                       if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        }, 
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1hr"
                        }
                        )
                        return res.status(201).json({
                            message: 'Authorization Success',
                            token: token
                            });
                       }
                       return res.status(401).json({
                        message: 'Authorization failed'
                        });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
        });

    //-------------Delete the user----------------//
    router.delete('/:userId', (req, res, next) => {
        const id = req.params.userId;
        User.remove({_id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted'
            }); 
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    })

module.exports = router;
