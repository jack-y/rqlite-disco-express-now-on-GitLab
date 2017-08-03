/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const bodyParser = require('body-parser')
const config = require('./config/config')
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const handler = require('./handler')
const http = require('http')
const https = require('https')
const store = require('./store')

// Express app
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Default headers
app.use(function (req, res, next) {
  // CORS headers
  // See: https://enable-cors.org/server_expressjs.html
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  res.setHeader('Access-Control-Max-Age', '1000')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  return next()
})

// Enables pre-flight request
app.options('/', cors())

// GET request: gets a current cluster data
app.get('/:id', function (req, res) {
  handler.get(config, store, fs, req, res)
  .then(function (result) {
    return result
  })
})

// POST request: gets a new cluster
app.post('/', function (req, res) {
  handler.postNew(config, store, fs, req, res)
  .then(function (result) {
    return result
  })
})

// POST request: adds a node to the current cluster
app.post('/:id', function (req, res) {
  handler.post(config, store, fs, req, res)
  .then(function (result) {
    return result
  })
})

// DELETE request: removes a node from the current cluster
app.delete('/:id', function (req, res) {
  handler.delete(config, store, fs, req, res)
  .then(function (result) {
    return result
  })
})

// Any other request
app.use(function (req, res, next) {
  handler.methodNotAllowed('Method not allowed', res)
})
// Error handler
app.use(function (err, req, res, next) {
  // Sets locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  handler.badRequest('Bad request', res)
})

// Runs the server on HTTP/S
var server = null
if (config.protocol.startsWith('https')) {
  server = https.createServer(config, app)
} else {
  server = http.createServer(app)
}
server.listen(config.port, function () {
  console.log('RQLite Cluster Discovery Service listening on',
    config.protocol, config.port)
})
