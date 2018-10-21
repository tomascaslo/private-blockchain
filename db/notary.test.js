'use strict';

const fs = require('fs');
const rimraf = require('rimraf');

const NotaryDB = require('./notary');

const dbName = 'notary-test';
let testDB = null;

describe('notary', function() {

  beforeAll(() => {
    testDB = new NotaryDB(dbName);
  });

  afterAll(() => {
    rimraf.sync(`./${dbName}`);
  });

  afterEach(() => {
    const rawDB = testDB.getDB();
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

  test('expect correct name to be set', () => {
    expect(testDB.fileName).toBe(dbName);
  });

  test('expect correct name to be set', () => {
    expect(testDB.fileName).toBe(dbName);
  });

  test('expect correct name to be set if undefined', () => {
    let anotherDB = new NotaryDB();
    let expectedName = dbName;

    expect(anotherDB.fileName).toBe(expectedName);
  });

  test('expect data to be added to levelDB with saveData()', async () => {
    const key = 'key';
    const expectedValue = 'value';
    await testDB.addData(key, expectedValue);
    const rawDB = testDB.getDB();
    const result = await rawDB.get(key);
    await rawDB.close()

    expect(result).toBe(expectedValue);
  });

  test('expect data to be retrieved correctly from levelDB with getData()', async () => {
    const key = 'key';
    const expectedValue = 'value';
    const rawDB = testDB.getDB();
    await rawDB.put(key, expectedValue);
    await rawDB.close()
    const result = await testDB.getData(key);

    expect(result).toBe(expectedValue);
  });

  test('expect data to be retrieved null on getData() and key doesnt exist in levelDB', async () => {
    const key = 'key';
    const result = await testDB.getData(key);

    expect(result).toBeNull();
  });


  test('expect data value to be added to levelDB with saveData()', async () => {
    const dataExpected = {
      address: 'address',
      timestamp: new Date().getTime(),
      message: 'message',
      validationWindow: 300
    }
    await testDB.saveData(dataExpected);
    const rawDB = testDB.getDB();
    const result = await rawDB.get(dataExpected.address);
    await rawDB.close()

    expect(JSON.parse(result)).toEqual(dataExpected);
  });

  test('expect to get the correct amount of records with getChainLength()', async () => {
    let data = null;
    for (let i = 0; i < 10; i++) {
      data = {
        address: 'address' + i,
        timestamp: new Date().getTime(),
        message: 'message',
        validationWindow: 300
      };
      await testDB.saveData(data);
    }
    const amount = await testDB.getAmountOfRecords();

    expect(amount).toBe(10);
  });

});


