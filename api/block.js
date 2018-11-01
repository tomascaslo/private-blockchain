'use strict';

const express = require('express');
const debug = require('debug')('api:block');
const { Block } = require('../simpleChain');
const StarRegistry = require('../star-registry');
const Star = require('../star');
const { NotFound, InternalServerError, BadRequest } = require('./utils/http-status-codes');
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
.post('/', async (req, res, next) => { // TODO: Move all this logic elsewhere.
  const blockchain = global.blockchain;
  const body = req.body || {};
  const starRegistry = new StarRegistry(blockchain);
  const isValid = await starRegistry.isValid(body.address);

  if (!isValid) {
    return res.status(BadRequest).send(`Registration of stars for address ${body.address} has expired. Please request a new token for validation at /requestValidation.`);
  }

  let star, block;
  try {
    star = new Star(body);
    block = new Block(star);
  } catch(e) {
    return res.status(BadRequest).send(e.message);
  }

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
