'use strict';

const fs = require('fs');
const rimraf = require('rimraf');

const ChainDB = require('./chain');

const dbName = 'chaindata-test';
let testDB = null;

describe('chain', () => {

  beforeAll(() => {
    testDB = new ChainDB(dbName);
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

  test('expect correct name to be set if undefined', () => {
    let anotherDB = new ChainDB();
    let expectedName = dbName;

    expect(anotherDB.fileName).toBe(expectedName);
  });

  test('expect data to be added to levelDB with addData()', async () => {
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

  test('expect data to throw error on getData() and key doesnt exist in levelDB', async () => {
    const key = 'key';

    try {
      await testDB.getData(key);
    } catch(err) {
      expect(err).toBeTruthy();
    }
  });

  test('expect data value to be added to levelDB with addDataValue()', async () => {
    await testDB.addDataValue('newValue1');
    await testDB.addDataValue('newValue2');
    const rawDB = testDB.getDB();
    const value1 = await rawDB.get(0);
    const value2 = await rawDB.get(1);
    await rawDB.close()

    expect(value1).toBe('newValue1');
    expect(value2).toBe('newValue2');
  });

  test('expect to get the correct amount of records with getChainLength()', async () => {
    for (let i = 0; i < 10; i++) {
      await testDB.addDataValue(i.toString());
    }
    const amount = await testDB.getChainLength();

    expect(amount).toBe(10);
  });

  test('expect to get the last record with getLast()', async () => {
    for (let i = 0; i < 10; i++) {
      await testDB.addDataValue(i.toString());
    }
    const lastRecord = await testDB.getLastRecord();

    expect(lastRecord).toBe("9");
  });

});
