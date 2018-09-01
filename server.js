'use strict';

const app = require('./app');
const { Blockchain } = require('./simpleChain');

// Load simpleChain before running server
Blockchain.load().then((blockchain) => {
  // Set as global to be able to use it everywhere
  global.blockchain = blockchain;

  app.listen(
    8000,
    () => console.log('simpleChain api running on port 8000!')
  );
});
