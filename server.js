'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const block = require('./api/block');
const { Blockchain } = require('./simpleChain');
const app = express();

// Middleware
app.use(bodyParser.json());

// Api routes
app.use('/block', block);

// Load simpleChain before running server
Blockchain.load().then((blockchain) => {
  // Set as global to be able to use it everywhere
  global.blockchain = blockchain;

  app.listen(
    8000,
    () => console.log('simpleChain api running on port 8000!')
  );
});
