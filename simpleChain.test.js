'use strict';

const rimraf = require('rimraf');

const { Block, Blockchain } = require('./simpleChain');
const LevelDB = require('./levelSandbox');
const testUtils = require('./test-utils');

const dbname = 'chaindata-test';

describe('simpleChain', () => {

  describe('Block', () => {

    test('expect Block to have default attributes on creation', () => {
      const block = new Block('data');
      const blockKeys = Object.keys(block);

      expect(blockKeys).toContain('hash');
      expect(blockKeys).toContain('height');
      expect(blockKeys).toContain('body');
      expect(blockKeys).toContain('time');
      expect(blockKeys).toContain('previousBlockHash');
    });

  });

  describe('Blockchain', () => {

    afterEach(() => {
      const rawDB = (new LevelDB()).getDB();
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
    });

    afterAll(() => {
      rimraf.sync(`./${dbname}`);
    })

    test('expect load blockchain with genesis block', async () => {
      const blockchain = await Blockchain.load();
      const rawDB = await (new LevelDB(dbname)).getDB();
      const genesisBlock = await rawDB.get(0);
      await rawDB.close()

      expect(genesisBlock).toEqual(expect.stringMatching('Genesis block'));
    });

    test('expect new block to be persisted to db with addBlock()', async () => {
      const expectedBlockData = 'my new block';
      const blockchain = await Blockchain.load();
      const newBlock = new Block(expectedBlockData);
      await blockchain.addBlock(newBlock);
      const lastBlock = await blockchain.getLastBlock();

      expect(lastBlock.body).toEqual(expect.stringMatching(expectedBlockData))
    });

    test('expect to get block at specified height with getBlock()', async () => {
      const expectedBlockData = 'some block data'
      const blockchain = await testUtils.createBlockchain();
      await blockchain.addBlock(new Block(expectedBlockData));
      await testUtils.addRandomBlocks(blockchain);
      const blockHeight11 = await blockchain.getBlock(11);

      expect(blockHeight11.body).toEqual(expect.stringMatching(expectedBlockData));
    });

    test('expect block to be valid with validateBlock()', async () => {
      const expectedBlockData = 'some block data'
      const blockchain = await testUtils.createBlockchain();
      await blockchain.addBlock(new Block(expectedBlockData));
      await testUtils.addRandomBlocks(blockchain);
      const isBlockValid = await blockchain.validateBlock(11);

      expect(isBlockValid).toBe(true);
    });

    test('expect block to be invalid with validateBlock()', async () => {
      const testBlockPosition = 11;
      const expectedBlockData = 'some block data'
      const blockchain = await testUtils.createBlockchain();
      await blockchain.addBlock(new Block(expectedBlockData));
      await testUtils.addRandomBlocks(blockchain);

      // Insert invalid block hash
      const block = await blockchain.getBlock(testBlockPosition);
      block.hash = testUtils.randomContent();
      const rawDB = await (new LevelDB()).getDB();
      await rawDB.put(testBlockPosition, JSON.stringify(block));
      await rawDB.close();

      const isBlockValid = await blockchain.validateBlock(testBlockPosition);

      expect(isBlockValid).toBe(false);
    });

    test('expect blockchain to be valid with validateChain()', async () => {
      const blockchain = await testUtils.createBlockchain(10);

      const isBlockchainValid = await blockchain.validateChain();

      expect(isBlockchainValid).toBe(true);
    });

    test('expect blockchain to be invalid with validateChain()', async () => {
      const testBlockPosition = 5;
      const blockchain = await testUtils.createBlockchain(10);
      const rawDB = await (new LevelDB).getDB();
      // Modify a single block's content
      const block = JSON.parse(await rawDB.get(testBlockPosition));
      block.body = testUtils.randomContent();
      await rawDB.put(testBlockPosition, JSON.stringify(block));
      await rawDB.close();

      const isBlockchainValid = await blockchain.validateChain();

      expect(isBlockchainValid).toBe(false);
    });

  });

});
