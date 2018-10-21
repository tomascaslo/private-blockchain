'use strict';

const request = require('supertest');

const { Block, Blockchain } = require('./simpleChain');
const app = require('./app');
const testUtils = require('./test-utils');

const dbName = 'chaindata-test';
const notaryDbName = 'notary-test';

describe('api', () => {
  afterAll(() => {
    rimraf.sync(`./${dbName}`);
    rimraf.sync(`./${notaryDbName}`);
  });

  beforeEach(async () => {
    global.blockchain = await Blockchain.load();
  });

  afterEach(() => {
    return Promise.all([
      testUtils.resetChainDB(),
      testUtils.resetNotaryDB(),
    ]);
  });

  describe('GET /block/:height', () => {

    test('expect to get correct block', async () => {
      const blockHeight = 11;
      const endpoint = `/block/${blockHeight}`;
      const expectedBlockData = 'block 11 data'
      const blockchain = await testUtils.createBlockchain();
      await blockchain.addBlock(new Block(expectedBlockData));
      await testUtils.addRandomBlocks(blockchain);

      const response = await request(app).get(endpoint);
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
      expect(response.body.height).toEqual(11);
      expect(response.body.body).toEqual(expectedBlockData);
    });

    test('expect to return 404 on height not found', async () => {
      const blockHeight = 11;
      const endpoint = `/block/${blockHeight}`;
      const expectedBlockData = 'block 11 data'
      const blockchain = await testUtils.createBlockchain();

      const response = await request(app).get(endpoint);
      expect(response.statusCode).toBe(404);
      expect(response.text.trim().toLowerCase()).toEqual('block not found')
    });
  });

  describe('POST /block', () => {

    test('expect to create block correctly', async () => {
      const blockHeight = 6;
      const endpoint = `/block`;
      const expectedBlockData = 'block 6 data'
      const blockchain = await testUtils.createBlockchain(5);

      const response = await request(app)
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({body: expectedBlockData});
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
      expect(response.body.height).toEqual(6);
      expect(response.body.body).toEqual(expectedBlockData);
    });

    test('expect to return 500 on block creation failure', async () => {
      const blockHeight = 13;
      const endpoint = `/block`;
      const expectedBlockData = 'block 13 data'
      const blockchain = global.blockchain = await testUtils.createBlockchain(12);

      const addBlockMock = blockchain.addBlock = jest.fn().mockImplementation(() => {
        return Promise.reject();
      });
      const response = await request(app)
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({body: expectedBlockData});
      expect(addBlockMock.mock.calls.length).toBe(1);
      expect(response.statusCode).toBe(500);
      expect(response.text.trim().toLowerCase()).toEqual('internal server error');
      addBlockMock.mockRestore();
    });

  });

  describe('POST /requestValidation', () => {

    test('expect to return address data when on first request', async () => {
      const endpoint = '/requestValidation';
      const response = await request(app)
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({address: 'someaddress'});
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
    });

    test('expect to return existing address data', async () => {
      const endpoint = '/requestValidation';
      const address = 'someaddress';
      // This should create the initial data for address
      const initialResponse = await request(app)
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({address});
      const response = await request(app)
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({address});
      expect(response.statusCode).toBe(200);
      expect(initialResponse.body.address).toBe(response.body.address);
      expect(initialResponse.body.timestamp).toBe(response.body.timestamp);
      expect(initialResponse.body.message).toBe(response.body.message);
      expect(initialResponse.body.validationWindow).not.toBe(response.body.validationWindow);
    });

  });

});

