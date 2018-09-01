'use strict';

const express = require('express');
const debug = require('debug')('api:block');
const simpleChain = require('../simpleChain');
const router = express.Router();

router
.get('/:height(\\d+)', async (req, res) => {
  // Get block height
  const height = parseInt(req.params.height);
  // Validate block height
  const blockchain = global.blockchain;
  debug(`Getting block ${height}.`);
  try {
    const block = await blockchain.getBlock(height);
  } catch(e) {
    debug('Error retrieving block.');
    throw e;
  }

  debug('Got block.');

  // Return response
  res.json(block);
});

module.exports = router;
