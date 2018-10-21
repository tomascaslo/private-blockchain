'use strict';
// Create fixtures and other testing convenient functions

const { Block, Blockchain } = require('./simpleChain');
const ChainDB = require('./db/chain');

let base36Chars = '';

function randomContent() {
  if (!base36Chars) {
    for (let i = 0; i < 36; i++) {
      base36Chars += i.toString(36);
    }
  }

  const contentLength = Math.floor(Math.random() * 20);
  let content = '';
  for (let i = 0; i < contentLength; i++) {
    content += base36Chars.charAt(Math.floor(Math.random() * base36Chars.length));
  }

  return content;
}

function createNewBlock(data) {
  data = data || randomContent();
  return new Block(data);
}

async function createBlockchain(numBlocks=10) {
  const blockchain = await Blockchain.load();
  for (let i = 0; i < numBlocks; i++) {
    await blockchain.addBlock(createNewBlock());
  }
  return blockchain;
}

async function addRandomBlocks(blockchain, numBlocks=10) {
  for (let i = 0; i < numBlocks; i++) {
    await blockchain.addBlock(createNewBlock());
  }
  return await blockchain.getBlockchainHeight();
}

async function invalidateChain(blockchain, blockKey) {
  const rawDB = (new ChainDB(blockchain.chain.fileName)).getDB();
  const block = JSON.parse(await rawDB.get(blockKey));
  block.body = randomContent();
  await rawDB.put(blockKey, JSON.stringify(block));
  await rawDB.close();
}

function resetDB() {
  const rawDB = (new ChainDB()).getDB();
  return new Promise((resolve, reject) => {
    rawDB.createKeyStream()
      .on('data', (key) => {
        console.log('Deleting key ' + key);
        rawDB.del(key);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        console.log('Closing db...');
        rawDB.close(() => {
          resolve();
        });
      });
  });
}

module.exports = {
  randomContent,
  createNewBlock,
  createBlockchain,
  addRandomBlocks,
  invalidateChain,
  resetDB,
}
