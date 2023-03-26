const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../auth/checkAuth');
const convertJson = require('../../util/converter');

router.post('/signup', (req, res) => {
  console.log('Posting', req.body);
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        res.status(409).json({
          message: 'Email Exists',
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            console.log(err.message);
            res.status(500).json({ error: err.message });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              address: req.body.address,
              city: req.body.city,
              state: req.body.state,
              zip: req.body.zip,
              email: req.body.email,
              password: hash,
            });
            // save user
            user
              .save()
              .then((result) => {
                result = convertJson(result);
                res.status(201).json({
                  message: 'User Created',
                  user: result,
                });
              })
              .catch((err) => {
                res.status(501).json({ message: err.message });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(501).json({ message: 'Unable to register the User' });
    });
});

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Authorization Failed' });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) return res.status(501).json({ message: err.message });
          if (result) {
            user = convertJson(user);
            const token = jwt.sign({ user: user }, process.env.jwt_key, {
              expiresIn: '20m',
            });
            res.status(200).json({
              message: 'Authorization Successful',
              token: token,
              user: user,
            });
          } else {
            res.status(401).json({ message: 'Authorization Failed' });
          }
        });
      }
    })
    .catch((err) => res.status(500).json({ message: 'Unable to login User' }));
});

router.get('/profile', checkAuth, (req, res, next) => {
  res.status(200).json({ message: req.userData });
});

module.exports = router;
