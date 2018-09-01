'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const blockRoutes = require('./api/block');

const app = express();

// Middleware
app.use(bodyParser.json());

// Api routes
app.use('/block', blockRoutes);

module.exports = app;
