'use strict';

const express = require('express');
const debug = require('debug')('api:block');
const { Block } = require('../simpleChain');
const Star = require('../star');
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const router = express.Router();

router
.get('/:height(\\d+)', async (req, res, next) => {
  // Get block height
  const height = parseInt(req.params.height);
  const blockchain = global.blockchain;
  debug(`Getting block ${height}.`);
  try {
    const block = await blockchain.getBlock(height);
    debug('Got block.');

    // Return response
    res.json(block);
  } catch(e) {
    debug('Error retrieving block.');
    // Return error
    res.status(NotFound).send('Block Not Found');
  }
})
.post('/', async (req, res, next) => {
  const blockchain = global.blockchain;
  const body = req.body.body || {};
  const star = new Star(body);
  // Create new block
  const block = new Block(star);

  try {
    await blockchain.addBlock(block);
    const lastBlock = await blockchain.getLastBlock();
    res.json(lastBlock);
  } catch(e) {
    debug('Error adding block.');
    res.status(InternalServerError).send('Internal Server Error');
  }
});


module.exports = router;
