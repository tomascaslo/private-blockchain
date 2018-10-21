'use strict';

const express = require('express');
const debug = require('debug')('api:notary');
const { Block } = require('../simpleChain');
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const router = express.Router();

router
.post('/requestValidation', async (req, res) => {
  const blockchainID = req.body.address;
  const timestamp = new Date().getTime();

  res.json()
});
