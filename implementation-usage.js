// You can test this file by running node > 9 interpreter on your cli
// and running '.load implementation-usage.js'

const { Blockchain, Block } = require('./simpleChain');
const testUtils = require('./test-utils');
const rimraf = require('rimraf');

const chainName = 'fakeoin'

// Create Blockchain
const blockchain = Blockchain.load(chainName);

blockchain.then((chain) => {

  // Add Blocks
  chain.addBlock(new Block('block1'))
    .then(() => {
      return chain.addBlock(new Block('block2'));
    })
    .then(() => {
      return chain.addBlock(new Block('block3'));
    })
    .then(() => {
      return chain.getBlockchainHeight();
    })
    .then((height) => {
      console.log('Chain height (should be 4): ' + height); // Consider the genesis block
      // Validate whole chain
      return chain.validateChain();
    })
    .then((isBlockchainValid) => {
      console.log('isBlockchainValid (should be true):' + isBlockchainValid);
      // Get block 2
      return chain.getBlock(2);
    })
    .then((block) => {
      console.log('block 2: ' + JSON.stringify(block));
      // validate block
      return chain.validateBlock(2);
    })
    .then((isBlockValid) => {
      console.log('isBlockValid (should be true): ' + isBlockValid);
      console.log('Invalidating chain...');
      return testUtils.invalidateChain(chain, 2);
    })
    .then(() => {
      // Get block 2
      return chain.getBlock(2);
    })
    .then((block) => {
      console.log('block 2: ' + JSON.stringify(block));
      return chain.validateBlock(2);
    })
    .then((isBlockValid) => {
      console.log('isBlockValid (should be false): ' + isBlockValid);
      // Validate blockchain after invalidating block
      return chain.validateChain();
    })
    .then((isBlockchainValid) => {
      console.log('isBlockchainValid (should be false): ' + isBlockchainValid);
      rimraf.sync('./' + chainName);
    });
});

