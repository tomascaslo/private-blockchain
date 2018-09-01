'use strict';

const express = require('express');
const debug = require('debug')('api:block');
const simpleChain = require('../simpleChain');
const { NotFound } = require('./utils/http-status-codes');
const router = express.Router();

router
.get('/:height(\\d+)', async (req, res, next) => {
  // Get block height
  const height = parseInt(req.params.height);
  // Validate block height
  const blockchain = global.blockchain;
  debug(`Getting block ${height}.`);
  try {
    const block = await blockchain.getBlock(height);
    debug('Got block.');

    // Return response
    res.json(block);
  } catch(e) {
    debug('Error retrieving block.');
    res.status(NotFound).send('Block Not Found');
  }
});

module.exports = router;
