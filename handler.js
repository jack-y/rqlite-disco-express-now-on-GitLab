/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const HTTPStatus = require('http-status')

// Initializations
var handler = {}

// GET current cluster
handler.get = function (options, store, fs, req, res) {
  return new Promise(function (resolve, reject) {
    // Gets the ID from the URL
    const id = req.params.id
    // Reads the data from the ID
    store.readAsCluster(options, id, fs)
    .then(function (cluster) {
    // Returns the data as JSON
      return resolve(handler.ok(cluster, res))
    })
    .catch(function (err) { // eslint-disable-line
      return resolve(handler.notFound(id + ' does not exist', res))
    })
  })
}

// POST new cluster item
handler.postNew = function (options, store, fs, req, res) {
  return new Promise(function (resolve, reject) {
    store.createCluster(options, fs)
    .then(function (cluster) {
      return resolve(handler.ok(cluster, res))
    })
    .catch(function (err) {
      return resolve(handler.serverError('Cannot create the new cluster.', res, err))
    })
  })
}

// POST request: adds a node to the current cluster
handler.post = function (options, store, fs, req, res) {
  return new Promise(function (resolve, reject) {
    // Retrieves the POST data
    handler.getPostAddress(req)
    .then(function (address) {
      // Gets the ID from the URL
      const id = req.params.id
      // Reads the data from the ID
      store.readAsCluster(options, id, fs)
      .then(function (cluster) {
        // Saves the data
        store.addAndSave(options, address, cluster, fs)
        .then(function (result) {
          // Returns the updated data as JSON
          return resolve(handler.ok(result, res))
        })
        .catch(function (err) {
          return resolve(handler.serverError('Cannot update the cluster ' +
            cluster.disco_id, res, err))
        })
      })
      .catch(function (err) { // eslint-disable-line
        return resolve(handler.notFound(id + ' does not exist', res))
      })
    })
    .catch(function (err) { // eslint-disable-line
      return resolve(handler.badRequest('address not specified', res))
    })
  })
}

// DELETE request
handler.delete = function (options, store, fs, req, res) {
  return new Promise(function (resolve, reject) {
    // Retrieves the POST data
    handler.getPostAddress(req)
    .then(function (address) {
      // Gets the ID from the URL
      const id = req.params.id
      // Reads the data from the ID
      store.readAsCluster(options, id, fs)
      .then(function (cluster) {
        // Removes the node and saves the data
        store.removeAndSave(options, address, cluster, fs)
        .then(function (result) {
          // Returns the updated data as JSON
          return resolve(handler.ok(result, res))
        })
        .catch(function (err) {
          return resolve(handler.serverError('Cannot update the cluster ' +
            cluster.disco_id, res, err))
        })
      })
      .catch(function (err) { // eslint-disable-line
        return resolve(handler.notFound(id + ' does not exist', res))
      })
    })
    .catch(function (err) { // eslint-disable-line
      return resolve(handler.badRequest('address not specified', res))
    })
  })
}

// Gets the node address from the POST body
handler.getPostAddress = function (req) {
  return new Promise(function (resolve, reject) {
    var body = ''
    // Retrieves the POST data
    req.on('data', function (chunk) {
      body += chunk
    })
    // All data is retrieved: JSON extract
    req.on('end', function () {
      // Converts the JSON body to an object
      try {
        let data = JSON.parse(body)
        if (data.addr) {
          return resolve(data.addr)
        } else {
          return reject(new Error('address does not exist in body'))
        }
      } catch (err) {
        // Bad JSON format
        return reject(new Error('address does not exist in body'))
      }
    })
  })
}

// Response OK
handler.ok = function (cluster, res) {
  return res.status(HTTPStatus.OK).json(cluster)
}

// Errors
handler.badRequest = function (message, res) {
  return res.status(HTTPStatus.BAD_REQUEST).json({error: message})
}

handler.notFound = function (message, res) {
  return res.status(HTTPStatus.NOT_FOUND).json({error: message})
}

handler.methodNotAllowed = function (message, res) {
  return res.status(HTTPStatus.METHOD_NOT_ALLOWED).json({error: message})
}

handler.serverError = function (message, res, err) {
  // Traces the error in the console
  console.log(message, 'Error:', err)
  // Sends the error response
  return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({error: message})
}

module.exports = handler
