'use strict';

const fs = require('fs');
const rimraf = require('rimraf');

const BaseAbstractDB = require('./base-abstract');

const dbName = 'base-abstract-test';
let testDB = null;

describe('chain', () => {

  beforeAll(() => {
    testDB = new BaseAbstractDB(dbName);
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

  test('expect getDefaultName() to throw Error when not implemented', () => {
    expect(() => { testDB.getDefaultName(); }).toThrow();
  });

  test('expect getActions() to throw Error when not implemented', () => {
    expect(() => { testDB.getActions(); }).toThrow();
  });

});
