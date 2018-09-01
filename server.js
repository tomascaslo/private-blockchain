'use strict';

const express = require('express');
const block = require('./api/block');
const { Blockchain } = require('./simpleChain');
const app = express();

app.use('/block', block);

// Handle errors

// Load simpleChain before running server
Blockchain.load().then((blockchain) => {
  // Set as global to be able to use it everywhere
  global.blockchain = blockchain;

  app.listen(
    8000,
    () => console.log('simpleChain api running on port 8000!')
  );
});
