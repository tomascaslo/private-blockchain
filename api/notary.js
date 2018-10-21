'use strict';

const express = require('express');
const debug = require('debug')('api:notary');
const { Block } = require('../simpleChain');
const { StarRegistry } = require('../star-registry')
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const router = express.Router();

router
.post('/requestValidation', async (req, res) => {
  const address = req.body.address;
  const data = StarRegistry().getOrCreateDataForAddress(address);

  res.json(data);
});
