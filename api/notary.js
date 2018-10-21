'use strict';

const express = require('express');
const debug = require('debug')('api:notary');
const { Block } = require('../simpleChain');
const StarRegistry = require('../star-registry');
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const router = express.Router();

router
.post('/requestValidation', async (req, res) => {
  const address = req.body.address;
  const starRegistry = new StarRegistry();
  const data = await starRegistry.getAddressData(address);

  res.json(data);
})
.post('/message-signature/validate', async (req, res) => {
  const address = req.body.address;
  const signature = req.body.signature;
  const starRegistry = new StarRegistry();
  const validationResponse = await starRegistry.validateRequestSignature(
    address, signature);

  res.json(validationResponse);
});

module.exports = router;
