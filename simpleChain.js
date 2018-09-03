'use strict';
/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const debug = require('debug')('simpleChain');

const LevelDB = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
  constructor(data) {
    this.hash = "";
    this.height = 0;
    this.body = data;
    this.time = 0;
    this.previousBlockHash = "";
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor(blockchainName) {
    this.chain = new LevelDB(blockchainName);
  }

  // Initializes the blockchain
  static async load(blockchainName) {
    debug(`load(${blockchainName})`);
    const blockchain = new this(blockchainName);
    const amountOfBlocks = await blockchain.getBlockchainHeight();
    const isNewBlockchain = amountOfBlocks <= 0;
    if (isNewBlockchain) {
      await blockchain.addBlock(new Block("First block in the chain - Genesis block"));
    }
    debug('Blockchain loaded.')
    return blockchain;
  }

  // Add new block
  async addBlock(newBlock) {
    debug(`addBlock(${newBlock})`);
    const currentHeight = await this.getBlockchainHeight();
    // Block height
    newBlock.height = currentHeight;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // previous block hash
    if (currentHeight > 0){
      const lastBlock = await this.getLastBlock();
      newBlock.previousBlockHash = lastBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    await this.chain.addDataValue(JSON.stringify(newBlock));
  }

  // get block
  async getBlock(blockHeight) {
    debug(`getBlock(${blockHeight})`);
    const block = await this.chain.getData(blockHeight);
    // return object as a single string
    return JSON.parse(block);
  }

  // validate block
  async validateBlock(blockHeight) {
    debug(`validateBlock(${blockHeight})`);
    // get block object
    const block = await this.getBlock(blockHeight);
    // get block hash
    const blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    const validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    debug('validateChain()');
    const chainLength = await this.getBlockchainHeight();
    let errorLog = [];
    for (let i = 0; i < chainLength; i++) {
      const isCurrentBlockValid = await this.validateBlock(i);
      // validate block
      if (!isCurrentBlockValid) {
        errorLog.push(i);
      }
      const nextBlockHeight = i + 1;
      if (nextBlockHeight < chainLength) {
        // compare blocks hash link
        const block = await this.getBlock(i);
        const blockHash = block.hash;
        const nextBlock = await this.getBlock(nextBlockHeight);
        const previousHash = nextBlock.previousBlockHash;
        if (blockHash !== previousHash) {
          errorLog.push(i);
        }
      }
    }

    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
      return false;
    } else {
      console.log('No errors detected');
      return true;
    }
  }

  // Get last block in chain
  async getLastBlock() {
    debug('getLastBlock()');
    const lastBlock = await this.chain.getLastRecord();
    return JSON.parse(lastBlock);
  }

  // Get block height
  async getBlockchainHeight() {
    debug('getBlockchainHeight()');
    const blockchainHeight = await this.chain.getAmountOfRecords();
    return blockchainHeight;
  }

  // Alias to getBlockchainHeight()
  async getBlockHeight() {
    debug('getBlockHeight()');
    return await this.getBlockchainHeight();
  }

}

module.exports = {
  Block,
  Blockchain,
};
