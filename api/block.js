'use strict';

const express = require('express');
const simpleChain = require('../simpleChain');
const router = express.Router();

router
.get('/:height(\\d+)', (req, res) => {
  // Get block height
  const height = parseInt(req.params.height);
  // Validate block height

  console.log('height');
  // Return response
  res.json({height});
});

module.exports = router;
