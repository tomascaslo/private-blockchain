'use strict';

const express = require('express');
const debug = require('debug')('api:block');
const { Block } = require('../simpleChain');
const StarRegistry = require('../star-registry');
const Star = require('../star');
const {
  NotFound,
  InternalServerError,
  BadRequest
} = require('./utils/http-status-codes');
const router = express.Router();

router
  .get('/:height(\\d+)', async (req, res, next) => {
    const blockchain = global.blockchain;
    const height = parseInt(req.params.height);
    debug(`Getting block ${height}.`);

    try {
      const block = await blockchain.getBlock(height);

      // Since block 0 body has a different format (string).
      if (height > 0) {
        const star = new Star(block.body);
        star.decodeStory();
        block.body.star = star;
      }

      debug('Got block.');

      // Return response
      res.json(block);
    } catch (e) {
      debug('Error retrieving block.');
      // Return error
      res.status(NotFound).send('Block Not Found');
    }
  })
  .post('/', async (req, res, next) => {
    // TODO: Move all this logic elsewhere.
    const blockchain = global.blockchain;
    const body = req.body || {};
    const starRegistry = new StarRegistry(blockchain);
    const isValid = await starRegistry.isValid(body.address);

    if (!isValid) {
      return res
        .status(BadRequest)
        .send(
          `Registration of stars for address ${
            body.address
          } has expired or has been used already. Please request a new token for validation at /requestValidation.`
        );
    }

    let star, block;
    try {
      star = new Star(body);
      star.encodeStory(); // Need to encode story to hex before saving.
      block = new Block(star);
    } catch (e) {
      return res.status(BadRequest).send(e.message);
    }

    try {
      await blockchain.addBlock(block);
      const lastBlock = await blockchain.getLastBlock();
      starRegistry.deleteDataForAddress(body.address);
      res.json(lastBlock);
    } catch (e) {
      debug('Error adding block.');
      res.status(InternalServerError).send('Internal Server Error');
    }
  });

module.exports = router;
