'use strict';

const express = require('express');
const debug = require('debug')('api:star');
const { NotFound, InternalServerError } = require('./utils/http-status-codes');
const StarRegistry = require('../star-registry');
const router = express.Router();

router
  .get('/:address(address:[\\da-zA-Z]+)', async (req, res, next) => {
    const params = req.params;
    const address = params.address.split(':')[1];
    const starRegistry = new StarRegistry(global.blockchain);
    let stars = null;

    try {
      stars = await starRegistry.getStarsForAddress(address);
    } catch (e) {
      debug(`Error retrieving star blocks for address ${address}.`);
      return res.status(InternalServerError).send('Internal Server Error');
    }

    if (stars) {
      res.json(stars);
    } else {
      res.status(NotFound).send(`Star Blocks For Address ${address} Not Found`);
    }
  })
  .get('/:hash(hash:[\\da-zA-Z]+)', async (req, res, next) => {
    const params = req.params;
    const hash = params.hash.split(':')[1];
    const starRegistry = new StarRegistry(global.blockchain);
    let star = null;

    try {
      star = await starRegistry.getStarByHash(hash);
    } catch (e) {
      debug(`Error retrieving star block by hash ${hash}.`);
      res.status(InternalServerError).send('Internal Server Error');
    }

    if (star) {
      res.json(star);
    } else {
      res.status(NotFound).send(`Star Block With Hash ${hash} Not Found`);
    }
  });

module.exports = router;
