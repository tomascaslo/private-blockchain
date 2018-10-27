'use strict';

const express = require('express');
const debug = require('debug')('api:star');
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const router = express.Router();

router
.get('/:address(address:[\\da-zA-Z]+)', (req, res, next) => {
  res.json({address: 'address'});
})
.get('/:hash(hash:[\\da-zA-Z]+)', (req, res, next) => {
  res.json({hash: 'hash'});
});

module.exports = router;
