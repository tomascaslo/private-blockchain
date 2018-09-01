'use strict';

const express = require('express');
const block = require('./api/block');
const app = express();

app.use('/block', block);

// Handle errors

app.listen(
  8000,
  () => console.log('simpleChain api running on port 8000!')
);
